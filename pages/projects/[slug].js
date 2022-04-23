import Airtable from "airtable";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import Head from "next/head";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageSection from "../../components/PageSection";
import ProjectGallery from '../../components/Project/ProjectGallery';
import ProjectHeader from '../../components/Project/ProjectHeader';
import ProjectMap from '../../components/Project/ProjectMap';
import MarkdownDivider from '../../components/MarkdownDivider';
import ProjectReport from "../../components/Project/ProjectReport";
import {getProject} from '../../utils/getProject';
import {geocodeAddress} from '../../utils/geocodeAddress';
import { siteTitle, siteUrl } from "../../toolkit.config";

dayjs.extend(relativeTime)

// getStaticPaths returns an array of URL paths
// these represent individual projects
export async function getStaticPaths(context) {

  const airtable = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  });

  // get all the records in the Projects table
  const records = await airtable
    .base(process.env.AIRTABLE_BASE_ID)('Projects')
    .select({ filterByFormula: process.env.RECORD_FILTER })
    .all();

  // generate an array of Projects
  // fetching only the fields we need to fetch more data in the next step
  const projects = records.map((proj) => {
    return {
      params: {
        id: proj.id,
        name: proj.get("Name"),
        slug: proj.get("Slug") || null,
        meetings: proj.get("Meetings") || null
      }
    }
  });

  return {
    paths: projects,
    fallback: false
  };
}

// for each staticPath/project, we now fetch the props
// with another call to Airtable, using the project slug
export async function getStaticProps(context) {

  const airtable = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  });

  // get the particular Project whose slug matches
  // the [slug] parameter
  const records = await airtable
    .base(process.env.AIRTABLE_BASE_ID)('Projects')
    .select({
      filterByFormula: `Slug="${context.params.slug}"`
    })
    .all();

  // we fetch just the first record from .all()
  // there should be only one!
  let record = records[0]
  if (records.length > 1) {
    console.log("Found too many records!")
  }

  // create another object we can return
  let project = getProject(record);

  // geocode that project's address
  let geometry = await geocodeAddress(project.address);

  let feature = {
    type: "Feature",
    geometry: geometry,
    properties: {...project}
  }

  return {
    props: {
      proj: project,
      feature: feature,
    },
  };
}

const ProjectPage = (props) => {
  let { proj, feature } = props;

  return (
    <>

      <Head>
        <title>{`${siteTitle}: ${proj.name}`}</title>
        <meta property="og:url" content={`${siteUrl}/projects/${proj.slug}`} />
        <meta property="og:type" content={`website`} />
        <meta property="og:title" content={`${siteTitle}: ${proj.name}`} />
        <meta property="og:description" content={
          `This ${proj.uses ? proj.uses.map(u => u.toLowerCase()).join(", ") : ''} project's status is "${proj.status ? proj.status.toLowerCase() : `?`}". Learn more about ${proj.name} in the ${siteTitle}.`
        } />
        {proj.images && proj.images.length > 0 && <meta property="og:image" content={proj.images[0].thumbnails.large.url} />}
      </Head>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <ProjectHeader {...proj} className='col-span-2' />
        <PageSection title="What's happening?" className="col-span-1 md:col-span-2 synopsis">
          <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget="_blank" className="px-0 md:px-3" >
            {proj.synopsis}
          </ReactMarkdown>
        </PageSection>
        <ProjectMap id={proj.id} feature={feature} project={proj} />
        {proj.images && proj.images.length > 0 && <ProjectGallery images={proj.images} caption={proj.imageCaption} />}
      </div>
      <MarkdownDivider />
      <ProjectReport id={proj.id} />
      <div className="text-sm font-normal mt-24 mx-auto max-w-xl text-center">
        The page was last updated at {dayjs(proj.lastModified).format('h:MMa')} on {dayjs(proj.lastModified).format('M/D/YY')}.
      </div>
    </>
  )
}

export default ProjectPage;
