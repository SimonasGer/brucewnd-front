import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Header } from "../../components/header/Header";
import "./comic.scss";

export const Comic = () => {
  const [comic, setComic] = useState({
    name: "",
    synopsis: "",
    coverImage: "",
    isPublished: false,
    createdAt: "",
    authorUsername: "",
    tags: [],
    chapters: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // admin-only UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [chapterForm, setChapterForm] = useState({ title: "", number: "" });
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false); // general spinner for actions

  const apiUrl = process.env.REACT_APP_API_URL;

  const checkRole = (role) => {
    const token = localStorage.getItem("brucewndtoken");
    if (!token) return false;

    const decoded = jwtDecode(token);
    const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const roles = Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];
    return roles.includes(role);
  };

  const isAdmin = useMemo(() => checkRole("admin"), []);

  // handy auth header for admin actions
  const authHeaders = () => {
    const token = localStorage.getItem("brucewndtoken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchItems = async () => {
      const name = window.location.pathname.split("/").pop();
      if (!name) {
        setError("Comic not found.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${apiUrl}/comics/${name}`);
        setComic(res.data);
      } catch (err) {
        console.error(err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [apiUrl]);

  // --- Admin handlers ---

  const handlePublishToggle = async () => {
    if (!isAdmin) return;
    setBusy(true);
    try {
      // optimistic toggle
      setComic((c) => ({ ...c, isPublished: !c.isPublished }));
      const endpoint = `${apiUrl}/comics/${encodeURIComponent(comic.name)}/publish`;
      await axios.patch(
        endpoint,
        { publish: !comic.isPublished },
        { headers: { ...authHeaders() } }
      );
    } catch (err) {
      // revert on fail
      setComic((c) => ({ ...c, isPublished: !c.isPublished }));
      console.error(err);
      setError("Failed to toggle publish state.");
    } finally {
      setBusy(false);
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setAdding(true);
    try {
      const payload = {
        title: chapterForm.title.trim(),
        number: chapterForm.number ? Number(chapterForm.number) : undefined,
      };
      const endpoint = `${apiUrl}/comics/${encodeURIComponent(comic.name)}/chapters`;
      const res = await axios.post(endpoint, payload, { headers: { ...authHeaders() } });
      // append new chapter to list
      setComic((c) => ({ ...c, chapters: [...c.chapters, res.data] }));
      setChapterForm({ title: "", number: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      setError("Failed to add chapter.");
    } finally {
      setAdding(false);
    }
  };

  const handleMove = async (chapterId, direction) => {
    if (!isAdmin) return;
    setBusy(true);
    try {
      // optimistic reorder on client
      setComic((c) => {
        const idx = c.chapters.findIndex((ch) => ch.id === chapterId);
        if (idx === -1) return c;

        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= c.chapters.length) return c;

        const newCh = [...c.chapters];
        const tmp = newCh[idx];
        newCh[idx] = newCh[targetIdx];
        newCh[targetIdx] = tmp;

        return { ...c, chapters: newCh };
      });

      const endpoint = `${apiUrl}/comics/${encodeURIComponent(
        comic.name
      )}/chapters/${chapterId}/move`;
      await axios.patch(
        endpoint,
        { direction }, // "up" | "down"
        { headers: { ...authHeaders() } }
      );
    } catch (err) {
      console.error(err);
      setError("Failed to move chapter.");
      // optional: refetch to correct order
      try {
        const res = await axios.get(`${apiUrl}/comics/${encodeURIComponent(comic.name)}`);
        setComic(res.data);
      } catch {}
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this chapter? This cannot be undone.")) return;

    setBusy(true);
    try {
      // optimistic remove
      const prev = comic.chapters;
      setComic((c) => ({ ...c, chapters: c.chapters.filter((ch) => ch.id !== chapterId) }));

      const endpoint = `${apiUrl}/comics/${encodeURIComponent(
        comic.name
      )}/chapters/${chapterId}`;
      await axios.delete(endpoint, { headers: { ...authHeaders() } });
    } catch (err) {
      console.error(err);
      setError("Failed to delete chapter.");
      // refetch to restore consistency
      try {
        const res = await axios.get(`${apiUrl}/comics/${encodeURIComponent(comic.name)}`);
        setComic(res.data);
      } catch {}
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteComic = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Delete the entire comic? This cannot be undone.")) return;

    setBusy(true);
    try {
      const endpoint = `${apiUrl}/comics/${encodeURIComponent(comic.name)}`;
      await axios.delete(endpoint, { headers: { ...authHeaders() } });
      // redirect home after delete
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Failed to delete comic.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main>
      <Header />
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading...</p>}

      {!loading && !error && (
        <section className="comic-details">
          {/* Admin toolbar (only visible to admins) */}
          {isAdmin && (
            <div className="admin-toolbar">
              <button className="btn" onClick={handlePublishToggle} disabled={busy}>
                {comic.isPublished ? "Unpublish" : "Publish"}
              </button>
              <button
                className="btn secondary"
                onClick={() => setShowAddForm((v) => !v)}
                disabled={busy}
              >
                {showAddForm ? "Cancel" : "Add Chapter"}
              </button>
              <button className="btn warn" onClick={handleDeleteComic} disabled={busy}>
                Delete Comic
              </button>
            </div>
          )}

          {isAdmin && showAddForm && (
            <form className="admin-form" onSubmit={handleAddChapter}>
              <input
                type="text"
                placeholder="Chapter title"
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Number (optional)"
                value={chapterForm.number}
                onChange={(e) => setChapterForm({ ...chapterForm, number: e.target.value })}
                min="1"
              />
              <button className="btn" disabled={adding}>
                {adding ? "Adding..." : "Create Chapter"}
              </button>
            </form>
          )}

          <h1>{comic.name}</h1>
          <img src={comic.coverImage} alt={`${comic.name} cover`} />
          <p>{comic.synopsis}</p>
          <p>Author: {comic.authorUsername}</p>
          <p>
            Published: <strong>{comic.isPublished ? "Yes" : "No"}</strong>
          </p>
          <p>Tags: {Array.isArray(comic.tags) ? comic.tags.join(", ") : comic.tags}</p>

          <h2>Chapters</h2>
          <ul className="chapters">
            {comic.chapters.map((chapter, index) => (
              <li key={chapter.id ?? index} className="chapter-item">
                <span className="title">
                  {chapter.number ? `${chapter.number}. ` : ""}
                  {chapter.title}
                </span>

                {/* Per-chapter admin actions */}
                {isAdmin && (
                  <div className="actions">
                    <button
                      className="icon-btn"
                      title="Move up"
                      onClick={() => handleMove(chapter.id, "up")}
                      disabled={busy || index === 0}
                    >
                      ▲
                    </button>
                    <button
                      className="icon-btn"
                      title="Move down"
                      onClick={() => handleMove(chapter.id, "down")}
                      disabled={busy || index === comic.chapters.length - 1}
                    >
                      ▼
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Delete"
                      onClick={() => handleDeleteChapter(chapter.id)}
                      disabled={busy}
                    >
                      ✖
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};
