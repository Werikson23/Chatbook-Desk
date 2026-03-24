export async function loadCountries() {
  try {
    const response = await fetch("https://cdn.jsdelivr.net/gh/dr5hn/countries-states-cities-database@master/json/countries.json");
    if (!response.ok) {
      return [];
    }
    const raw = await response.text();
    let data = [];
    try {
      data = JSON.parse(raw);
    } catch (_) {
      return [];
    }

    const language = localStorage.getItem("language") || "en";

    const countries = data.map(country => {
      let countryName = country.translations?.[language] || country.translations?.[language.slice(0, 2)] || country.name;
      return { iso2: country.iso2, phonecode: country.phonecode, name: countryName, emoji: country.emoji };
    }).sort((a, b) => a.name.localeCompare(b.name));

    return countries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

async function geolocateCountry() {
  // Try browser geolocation
  if ("geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      const { latitude, longitude } = position.coords;
      // Use OpenStreetMap Nominatim for reverse geocoding
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      if (!geoRes.ok) {
        return null;
      }
      const geoRaw = await geoRes.text();
      let geoData = null;
      try {
        geoData = JSON.parse(geoRaw);
      } catch (_) {
        return null;
      }
      const countryCode = geoData.address?.country_code;
      if (countryCode) {
        return countryCode.toUpperCase();
      }
    } catch (e) {
      // Permission denied or error, fallback below
    }
  }

  // Fallback to ipinfo.io
  try {
    const response = await fetch("https://ipinfo.io/json");
    if (!response.ok) {
      return null;
    }
    const raw = await response.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      return null;
    }
    return data.country;
  } catch (_) {
    return null;
  }
}


export const loadedCountries = await loadCountries();
export const currentCountry = await geolocateCountry();
