import { log, _ } from "./deps.ts";

// --------------- Logger Setup ---------------
await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),

    file: new log.handlers.FileHandler("INFO", {
      filename: "./log.txt",
      formatter: "{datetime} {levelName} {msg}",
    }),
  },

  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
  },
});

// --------------- Program Setup  ---------------
interface Launch {
  flightNumber: number;
  mission: string;
  youtubeId: string;
  ships: Array<string>;
}

const launches = new Map<number, Launch>();

// --------------- Helper Functions  ---------------
async function downloadLaunchData() {
  log.info("Downloading launch data...");

  const response = await fetch(
    "https://api.spacexdata.com/v4/launches",
    {
      method: "GET",
    },
  );

  if (response.ok) {
    log.info("Launch data successfully downloaded!");
  } else {
    log.warning("Problem downloading launch data.");
    throw new Error("Launch data download failed.");
  }

  const launchData = await response.json();

  for (const launch of launchData) {
    //   const payloads = launch["rocket"]["second_stage"]["payloads"];
    //   const customers = _.flatMap(payloads, (payload: any) => {
    //       return payload["customers"];
    //   });

    const flightData = {
      flightNumber: launch["flight_number"],
      mission: launch["name"],
      ships: launch["ships"],
      youtubeId: launch["links"]["youtube_id"],
    };

    launches.set(flightData.flightNumber, flightData);

    // log.info(JSON.stringify(flightData));
  }
}

async function postExample() {
  const response = await fetch("https://reqres.in/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      name: "Elon Musk",
      job: "billionaire",
    }),
  });

  return response.json();
}

//---------------------------------------------------------------------
// ----------                 MAIN PROGRAM                   ----------
//---------------------------------------------------------------------

if (import.meta.main) {
  await downloadLaunchData();
  log.info(`Downloaded data for ${launches.size} SpaceX launches.`);

  // console.log(await postExample());
}

// deno run --allow-net=api.spacexdata.com,reqres.in --allow-write mod.ts