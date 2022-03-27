import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
export const pages = [
  {
    name: "About this guide",
    href: "/guide/about-this-guide",
  },
  {
    name: "How to use this guide",
    href: "/guide/how-to-use-this-guide",
  },
  {
    name: "What you will need",
    href: "/guide/what-you-will-need",
  },
  {
    name: "Initial questions to ask",
    href: "/guide/initial-questions-to-ask",
  },
  {
    name: "Starting with the data",
    href: "/guide/starting-with-the-data",
  },
  {
    name: "Organizing your data: Airtable basics",
    href: "/guide/organize-your-data-airtable-basics",
  },
  {
    name: "Setting up your Airtable base",
    href: "/guide/setting-up-your-airtable-base",
  },
  {
    name: "Using the Projects table",
    href: "/guide/using-the-projects-table",
  },
  {
    name: "Using the Contact Us table",
    href: "/guide/using-the-contact-us-table",
  },
  {
    name: "Using the Tips table",
    href: "/guide/using-the-tips-table",
  },
  {
    name: "Setting up the site",
    href: "/guide/setting-up-the-site",
  },
  {
    name: "Customizing the site",
    href: "/guide/customizing-the-site",
  },
  {
    name: "Publishing the site",
    href: "/guide/publishing-the-site",
  },
   {
    name: "Managing your development tracker",
    href: "/guide/managing-your-development-tracker",
  },
  {
    name: "Harnessing public engagement and support",
    href: "/guide/harnessing-reader-engagement",
  },
    {
    name: "Launching your tracker for the public",
    href: "/guide/launching-your-tracker",
  },
  {
    name: "Getting in touch with us",
    href: "/guide/getting-in-touch-with-us",
  },
];

const TableOfContents = ({ index = null }) => {
  return (
    <>
      {index < pages.length && (
        <section className="flex items-center justify-between py-2 px-3 mt-8">
          <div>
            {index > 0 && (
              <>
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 mr-4" />
              <Link href={pages[index-1].href}>
                {pages[index - 1].name}
              </Link>
                </>
            )}
          </div>

          <div>
            {index < pages.length - 1 && (
              <>
              <Link href={pages[index+1].href}>
                {pages[index + 1].name}
              </Link>
                <FontAwesomeIcon icon={faArrowRight} className="h-4 ml-4" />
                </>
            )}
          </div>
        </section>
      )}
      <section className="px-4 py-4 mb-6 border-t-0">
        <h4>Table of contents</h4>
        <ol>
          {pages.map((page, ind) => (
            <li
              className={index === ind ? "font-bold my-1" : "my-1"}
              key={page.name}
            >
              <Link href={page.href}>{page.name}</Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
};

export default TableOfContents;
