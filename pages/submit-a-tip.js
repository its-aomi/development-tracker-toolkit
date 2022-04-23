import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Head from "next/head";
import { siteTitle } from "../toolkit.config";

const handleClick = (queryString, setResponse) => {
  fetch(`/api/createReport?${new URLSearchParams(queryString).toString()}`)
    .then((r) => r.json())
    .then((d) => setResponse(d));
};

export default function SubmitPage() {
  const [photoUrl, setPhotoUrl] = useState("");
  const [response, setResponse] = useState(null);

  async function handleUpload(e) {
    const reportFile = e.target.files[0];
    const { data, error } = await supabase.storage
      .from("report-photos")
      .upload(reportFile.name, reportFile, {
        cacheControl: "3600",
        upsert: false,
      });
    setPhotoUrl(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.Key}`
    );
  }

  const [address, setAddress] = useState("");
  const [report, setReport] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [publishPhoto, setPublishPhoto] = useState(null);

  let record = {
    Address: address,
    Report: report,
    Email: email,
  };

  if (publishPhoto === true) {
    record["Publish photo?"] = "Yes";
  }
  if (publishPhoto === false) {
    record["Publish photo?"] = "No";
  }

  if (photoUrl !== "") {
    record.Attachments = JSON.stringify([{ url: photoUrl }]);
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>{`${siteTitle}: Submit a tip`}</title>
        <meta
          name="description"
          content="Tracking development in Detroit, Michigan."
          key="description"
        />
        <meta property="og:title" content={siteTitle} key="title" />
        <meta
          property="og:description"
          content="Use the Detroit Development Tracker to look up information about real estate development in the city."
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="max-w-xl mx-auto submit-form">
        <h2>Let us know what you&apos;re seeing.</h2>
        <p className="pb-5 md:pb-11 leading-6">
          Do you see a project in your neighborhood or development activity?
          We&apos;ll check it out and get back to you.
        </p>
        <div>
          <label htmlFor="textarea">Where are you?</label>
          <input
            type="text"
            value={address}
            placeholder="Type an address or intersection."
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="textarea">What do you see?</label>
          <textarea
            cols={80}
            rows={5}
            value={report}
            onChange={(e) => setReport(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="photoupload">Upload a photo</label>
          <input
            type="file"
            id="photoupload"
            onChange={handleUpload}
            className="p-4 py-12"
          />
        </div>
        <div>
          <label htmlFor="textarea">What is the photo&apos;s source? </label>
          <radiogroup className="flex flex-col gap-2">
            <div className="flex items-center flex-row">
              <input
                type="radio"
                id="yespublish"
                checked={publishPhoto === true}
                onClick={() => setPublishPhoto(true)}
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
                checked={publishPhoto === false}
                onClick={() => setPublishPhoto(false)}
              />
              <label htmlFor="nopublish" className="inline ml-3 nostyle">
                I found this photo elsewhere or don&apos;t want it to be
                published.
              </label>
            </div>
          </radiogroup>
        </div>
        <div>
          <label htmlFor="textarea">What&apos;s your name? </label>
          <input
            type="text"
            placeholder=""
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="textarea">What&apos;s your email?</label>
          <input
            type="text"
            value={email}
            placeholder=""
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <article className="flex items-end">
          {!response ? (
            <button
              onClick={() => handleClick(record, setResponse)}
              disabled={response !== null}
            >
              {"Submit"}
            </button>
          ) : (
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
        </article>
      </div>
    </>
  );
}
