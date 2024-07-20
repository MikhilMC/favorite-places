/* eslint-disable prettier/prettier */
import * as SQLite from "expo-sqlite";
import Place from "../models/place";

export function init() {
  const promise = new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabaseAsync("places.db");

      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS places (
          id INTEGER PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          imageUri TEXT NOT NULL,
          address TEXT NOT NULL,
          lat REAL NOT NULL,
          lng REAL NOT NULL
        )`
      );
      // console.log("database connected");
      resolve();
    } catch (error) {
      resolve(error);
    }
  });

  return promise;
}

export function insertPlace(place) {
  const promise = new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabaseAsync("places.db");
      await db.runAsync(
        "INSERT INTO places (title, imageUri, address, lat, lng) VALUES (?, ?, ?, ?, ?)",
        place.title,
        place.imageUri,
        place.address,
        place.location.lat,
        place.location.lng
      );
      resolve();
    } catch (error) {
      reject(error);
    }
  });

  return promise;
}

export function fetchPlaces() {
  const promise = new Promise(async (resolve, reject) => {
    const db = await SQLite.openDatabaseAsync("places.db");

    const statement = await db.prepareAsync("SELECT * FROM places");
    try {
      const result = await statement.executeAsync();

      const allRows = await result.getAllAsync();

      const places = [];
      for (const row of allRows) {
        places.push(
          new Place(
            row.title,
            row.imageUri,
            {
              address: row.address,
              lat: row.lat,
              lng: row.lng,
            },
            row.id
          )
        );
      }

      resolve(places);
    } catch (error) {
      console.log(error);
      reject(error);
    } finally {
      await statement.finalizeAsync();
    }
  });
  return promise;
}

export function fetchPlaceDetails(id) {
  const promise = new Promise(async (resolve, reject) => {
    const db = await SQLite.openDatabaseAsync("places.db");

    const statement = await db.prepareAsync(
      "SELECT * FROM places WHERE id = $intValue"
    );

    try {
      const result = await statement.executeAsync({ $intValue: id });

      const row = await result.getFirstAsync();

      const place = new Place(
        row.title,
        row.imageUri,
        {
          lat: row.lat,
          lng: row.lng,
          address: row.address,
        },
        row.id
      );

      resolve(place);
    } catch (error) {
      reject(error);
    } finally {
      await statement.finalizeAsync();
    }
  });

  return promise;
}
