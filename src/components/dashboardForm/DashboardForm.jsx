import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./dashboardForm.scss";

export const DashboardForm = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [comic, setComic] = useState({
    name: "",
    synopsis: "",
    coverFile: null,
    tags: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const parseTags = (raw) =>
    (raw || "")
      .split(/[,\s]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

  async function presign(file) {
    const url = `${apiUrl}/uploads/presign?fileName=${encodeURIComponent(
      file.name
    )}&contentType=${encodeURIComponent(file.type)}`;
    const res = await axios.post(url);
    return res.data; // { uploadUrl, publicUrl }
  }

  async function uploadToS3(uploadUrl, file) {
    return axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
      maxBodyLength: Infinity,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let coverImageUrl = null;

      if (comic.coverFile) {
        const { uploadUrl, publicUrl } = await presign(comic.coverFile);
        await uploadToS3(uploadUrl, comic.coverFile);
        coverImageUrl = publicUrl;
      }

      const token = localStorage.getItem("brucewndtoken");

      await axios.post(
        `${apiUrl}/comics`,
        {
          name: comic.name,
          synopsis: comic.synopsis,
          coverImage: coverImageUrl,
          isPublished: false,
          tags: parseTags(comic.tags),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComic((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setComic((prev) => ({ ...prev, coverFile: file }));
  };

  return (
    <form onSubmit={handleSubmit} className="dashboard-form">
      <fieldset>
        <input
          type="text"
          name="name"
          placeholder="Comic Title"
          onChange={handleChange}
          required
        />
        <textarea
          name="synopsis"
          placeholder="Synopsis"
          onChange={handleChange}
        />
        <input
          type="file"
          name="coverFile"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFile}
        />
        <textarea
          name="tags"
          placeholder="Tags (comma or space separated)"
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Comic"}
        </button>
        {error && <p className="error">{error}</p>}
      </fieldset>
    </form>
  );
};
