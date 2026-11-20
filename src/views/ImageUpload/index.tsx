import { Pencil } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLogoUrl, selectCompany } from "@/toolkit/Company/reducer";

type UploadPopupProps = {
  onUploadComplete?: (fileUrl: string) => void; // callback with uploaded file URL
  id?: string;
};

const UploadPopup: React.FC<UploadPopupProps> = ({
  onUploadComplete,
}) => {
  const dispatch = useDispatch();
  const company = useSelector(selectCompany);

  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => {
    setIsOpen(false);
    setFile(null);
    setUploading(false);
    setError(null);
    setSuccessUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Ask the server for a signed upload URL (it chooses the storage key).
      const signRes = await fetch("/api/uploads/company-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "logo", contentType: file.type, size: file.size }),
      });
      if (!signRes.ok) {
        const problem = await signRes.json().catch(() => null);
        throw new Error(problem?.error?.message ?? "Could not start the upload");
      }
      const { uploadUrl, fileUrl } = await signRes.json();

      // 2. Upload the file straight to storage.
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // 3. Save it on the company.
      const saveRes = await fetch("/api/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: fileUrl }),
      });
      if (!saveRes.ok) throw new Error("Could not save the logo");

      setSuccessUrl(fileUrl);
      onUploadComplete?.(fileUrl);
      dispatch(updateLogoUrl(fileUrl));
    } catch (err: any) {
      setError(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button onClick={openPopup} className="btn px-2" type="button">
        <Pencil color="white" />
      </button>

      {isOpen && (
        <div
          id="logo-upload-modal"
          className="modal-backdrop"
          onClick={closePopup}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Update company logo</h2>

            <label htmlFor="company-logo-file" className="form-label">
              PNG, JPG or WebP, up to 2 MB
            </label>
            <input
              id="company-logo-file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="file-input"
            />

            {error && <p className="error-text" role="alert">{error}</p>}

            {successUrl && (
              <p className="success-text">
                Upload successful! File URL:{" "}
                <a
                  href={successUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  View File
                </a>
              </p>
            )}

            <div className="button-group">
              <button
                onClick={closePopup}
                disabled={uploading}
                className="btn-secondary"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={uploadFile}
                disabled={uploading || !file}
                className="btn-primary"
                type="button"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadPopup;
