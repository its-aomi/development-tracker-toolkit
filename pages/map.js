import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Airtable from "airtable";
import mapboxgl, { GeolocateControl, Map, NavigationControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProjectList from "../components/ProjectList";
import mapstyle from "../styles/mapstyle.json";
import { boundingBox, city, siteTitle, state } from "../toolkit.config";
import { getProject } from "../utils/getProject";
import { geocodeAddress } from "../utils/geocodeAddress";

export async function getStaticProps(context) {
  const airtable = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  });

  const records = await airtable
    .base(process.env.AIRTABLE_BASE_ID)("Projects")
    .select({
      sort: [{ field: "Last Modified", direction: "desc" }],
      filterByFormula: process.env.RECORD_FILTER,
    })
    .all();

  const projects = records.map((proj) => getProject(proj, false));

  let features = []
  for (let proj of projects) {
    let geocoded = await geocodeAddress(proj.address);

    features.push({
      type: "Feature",
      properties: {...proj},
      geometry: geocoded
    })
  }

  return {
    props: {
      projects,
      features
    },
  };
}

export default function ProjectMapPage(props) {
  console.log(props.features)
  let [theMap, setTheMap] = useState(null);
  let [theGeocoder, setTheGeocoder] = useState(null);

  let [visibleProjects, setVisibleProjects] = useState(props.features);

  let [result, setResult] = useState(null);

  const router = useRouter();

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    let map = new Map({
      container: "map",
      style: mapstyle,
      bounds: boundingBox,
    });

    map.addControl(new NavigationControl());

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      placeholder: `Search for an address in ${city}`,
      bbox: boundingBox,
      countries: "us",
    });

    geocoder.addTo("#geocoder");

    setTheGeocoder(geocoder);

    // Add geocoder result to container.
    geocoder.on("result", (e) => {
      setResult(e.result);
    });

    // Clear results container when search is cleared.
    geocoder.on("clear", () => {
      setResult(null);
    });

    map.addControl(
      new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      })
    );

    map.on("load", () => {
      map.resize();

      setTheMap(map);

      map.getSource("projects").setData({
        type: "FeatureCollection",
        features: props.features,
      });

    });

    map.on("click", (e) => {
      let features = map.queryRenderedFeatures(e.point, {
        layers: ["projects-circle"],
      });
      let labels = map.queryRenderedFeatures(e.point, {
        layers: ["projects-label"],
      });

      if (labels.length > 0) {
        router.push(`/projects/${labels[0].properties.slug}`);
      }
      if (features.length > 0) {
        map.flyTo({
          center: features[0].geometry.coordinates,
          zoom: 16.5,
        });
      }
    });

    map.on("moveend", () => {
      let visibleFeatures = map.queryRenderedFeatures({
        layers: ["projects-circle", "projects-label"],
      });

      // dedupe features based on slug
      let reducedFeatures = visibleFeatures.reduce((unique, item) => {
        if (
          unique.length > 0 &&
          unique.map((p) => p.properties.slug).includes(item.properties.slug)
        ) {
          return unique;
        } else {
          return [...unique, item];
        }
      }, []);

      setVisibleProjects(reducedFeatures);
    });
  }, []);

  useEffect(() => {
    if (theMap && result) {
      theMap.flyTo({
        center: result.geometry.coordinates,
        zoom: 15,
      });
    }
  }, [result]);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>{`${siteTitle}: Map of all projects`}</title>
        <meta
          name="description"
          content={`Tracking development in ${city}, ${state}.`}
          key="description"
        />
        <meta property="og:title" content={siteTitle} key="title" />
        <meta
          property="og:description"
          content={`Use the ${siteTitle} to look up information about real estate development in the city.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="max-w-xl mx-auto">
        <h2>Map of {city} development projects</h2>
        <p className="pb-2">
          Explore the map or enter an address to see developments in {city}.
          <span className="block">Click on a project to see more details.</span>
        </p>
        <span className="font-light bg-highlight mb-4 text-sm">
          {" "}
          See something missing? <Link href={`/submit-a-tip`}>
            Send a tip
          </Link>{" "}
          to help track {city} development.
        </span>
      </div>
      <div id="geocoder" className="my-7 max-w-xl mx-auto"></div>
      <div id="map" className="max-w-6xl mx-auto border-1 border-black h-96" />
      <ProjectList
        projects={visibleProjects.map(p => p.properties)}
        title="All development projects in the current map view"
      />
    </>
  );
}
