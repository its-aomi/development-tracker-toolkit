import { useState } from "react";
import SiteSection from "../../components/SiteSection";
import { supabase } from "../../utils/supabaseClient";

const ProjectReport = ({ id }) => {
  const handleClick = (queryString, photoUrl, setResponse) => {
    if (photoUrl) {
      queryString.Attachments = JSON.stringify([{ url: photoUrl }]);
    }

    fetch(`/api/createReport?${new URLSearchParams(queryString).toString()}`)
      .then((r) => r.json())
      .then((d) => setResponse(d));
  };

  const [photoUrl, setPhotoUrl] = useState("");

  async function handleUpload(e) {
    const avatarFile = e.target.files[0];
    const { data, error } = await supabase.storage
      .from("report-photos")
      .upload(avatarFile.name, avatarFile, {
        cacheControl: "3600",
        upsert: false,
      });
    setPhotoUrl(
      `https://zikieyzmibovmrmmdxso.supabase.in/storage/v1/object/public/${data.Key}`
    );
  }

  const [record, setRecord] = useState({
    Report: "",
    Email: "",
    Projects: id,
    Name: "",
    "Publish photo?": null,
  });

  const [response, setResponse] = useState(null);

  return (
    <div className="max-w-xl submit-form mx-auto">
      <h2 className="mb-9">Tell us what you know about this project</h2>
      <div className="flex flex-col mb-2 border">
        <label htmlFor="contact">What do you see?</label>
        <textarea
          value={record.Report}
          rows={4}
          className="w-full"
          onChange={(e) => setRecord({ ...record, Report: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="photoupload">Upload a photo (optional)</label>
        <input
          type="file"
          id="photoupload"
          onChange={handleUpload}
          className="p-4 py-12"
        />
      </div>
      <div className="flex flex-col mb-2 border">
        <label htmlFor="contact">What&apos;s your email? (optional)</label>
        <input
          type="text"
          value={record.Email}
          name="contact"
          id="contact"
          onChange={(e) => setRecord({ ...record, Email: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="textarea">What&apos;s your name? </label>
        <input
          type="text"
          placeholder=""
          value={record.Name}
          onChange={(e) => setRecord({ ...record, Name: e.target.value })}
        />
      </div>
      <div>
          <label htmlFor="textarea">What is the photo&apos;s source? </label>
          <radiogroup className="flex flex-col gap-2">
            <div className="flex items-center flex-row">
              <input
                type="radio"
                id="yespublish"
                checked={record["Publish photo?"] === 'Yes'}
                onClick={(e) => setRecord({ ...record, "Publish photo?": 'Yes' })}
                className="inline"
              />
              <label htmlFor="yespublish" className="inline ml-3 nostyle">
                I took this photo and you can publish it in the tracker.
              </label>
            </div>
            <div className="flex items-center flex-row">
              <input
                type="radio"
                id="nopublish"
                className="inline"
                checked={record["Publish photo?"] === 'No'}
                onClick={(e) => setRecord({ ...record, "Publish photo?": 'No' })}
              />
              <label htmlFor="nopublish" className="inline ml-3 nostyle">
                I found this photo elsewhere or don&apos;t want it to be
                published.
              </label>
            </div>
          </radiogroup>
        </div>
      <div className="flex items-center justify-around">
        {!response && (
          <button
            onClick={() => handleClick(record, photoUrl, setResponse)}
            disabled={response !== null}
            className="my-3 mx-auto w-32"
          >
            {"Submit"}
          </button>
        )}
        {response && (
          <span
            className="w-full flex justify-around items-center py-8 text-lg leading-6"
            style={{
              background: `rgba(215, 226, 255, 0.4)`,
              fontFamily: "DM Sans",
            }}
          >
            Thanks! We received your tip.
          </span>
        )}
      </div>
    </div>
  );
};

export default ProjectReport;
