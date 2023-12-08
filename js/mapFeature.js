document.addEventListener("DOMContentLoaded", function () {
  mapboxgl.accessToken = "pk.eyJ1IjoiY3p5bm9uam9obiIsImEiOiJjbG9xZWVzcnIwaDBpMmttenpza2I1ajZqIn0.SXmiSmtjjBMSmMA_rmVwiw";

  const walkingThresholdinMeters = 1000; // willing ka ba maglakad ng 1km para makatry ng ibang route?
  const numberOfClosestRoutes = 2; // ilang route na within sa walking threshold ang gusto mo tingnan
  const howManyRoutes = 5;
  const walkingLineIds = [];
  const commonRouteIds = [];  
  const polylines = [];
  const markers = []; 
  
  const mapBounds = new mapboxgl.LngLatBounds([
    [120.821471,13.583923], // Southwest corner
    [121.217243,13.905142] // Northeast corner
  ]);

  const map = new mapboxgl.Map({ 
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: [121.05235981732966, 13.773815015863619],
    zoom: 13,
    maxBounds: mapBounds,
  });

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
  });
  
  map.addControl(geocoder, 'top-left');
  map.addControl(new mapboxgl.NavigationControl(), "bottom-right"); // button for zooming

  var startMarker, endMarker;
  var settingStart = false;
  var settingEnd = false;

  const polylineInfo = [
    {url: "http://localhost/Karipas/Karipas%20Cult/RoutesPoly/alangilan.json",color: "#ff0000", width: 9, name: "Alangilan", pin:"http://localhost/Karipas/Karipas%20Cult/images/alangilanpin.png"},
    {url: "http://localhost/Karipas/Karipas%20Cult/RoutesPoly/balagtas.json",color: "#00ff00",width: 4, name: "Balagtas", pin:"http://localhost/Karipas/Karipas%20Cult/images/balagtas.pin.png"},
    {url: "http://localhost/Karipas/Karipas%20Cult/RoutesPoly/bauanbat.json",color: "#113c82",width: 5, name: "Bauan", pin: "http://localhost/Karipas/Karipas%20Cult/images/bauanpin.png"},
    {url: "http://localhost/Karipas/Karipas%20Cult/RoutesPoly/libjo.json",color: "#5a2476",width: 5, name: "Libjo", pin:"http://localhost/Karipas/Karipas%20Cult/images/libjopin.png"},
  ];

  function displayAllRoutes(polylineData, color) { // for showing routes on map. pede tanggalin
    map.addSource(polylineData.id, {
      type: "geojson",
      data: polylineData.data,
    });

    map.addLayer({
      id: polylineData.id,
      type: "line",
      source: polylineData.id,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": color,
        "line-width": 8,  
        "line-opacity": 0.18,
      },
    });
  }

  map.on("load", function () { // for showing routes. pede tanggalin
    polylineInfo.forEach((info) => {
      fetch(info.url)
        .then((response) => response.json())
        .then((data) => {
          const polylineData = {
            id: `custom-polyline-${polylines.length + 1}`,
            data: data,
          };
          displayAllRoutes(polylineData, info.color);
          polylines.push(polylineData);
        })
        .catch((error) =>
          console.error(`Error loading polyline: ${info.url}`, error)
        );
    });
  });

  map.on("click", function (e) { // interaction sa map. default halos 
    if (settingStart) {
      handleMarkerSetting(e, "start");
    } else if (settingEnd) {
      handleMarkerSetting(e, "end");
    }
  });

  function setMode(mode) { // for buttons lang
    settingStart = mode === "start";
    settingEnd = mode === "end";
  }
  
  function handleMarkerSetting(e, type) {
    const marker = type === "start" ? startMarker : endMarker;
    const markerImage = type === "start"
  ? "http://localhost/Karipas/Karipas%20Cult/images/mapbox-marker-icon-20px-green.png"
  : "http://localhost/Karipas/Karipas%20Cult/images/mapbox-marker-icon-20px-red.png";


    if (marker) {
        marker.remove();
    }

    const lngLat = e.lngLat;

    const newMarker = new mapboxgl.Marker({
        element: createCustomMarker(markerImage),
    }).setLngLat(lngLat).addTo(map);

    if (type === "start") {
        startMarker = newMarker;
    } else {
        endMarker = newMarker;
    }

    showAddress(lngLat, type);
  }

  function createCustomMarker(markerImage) {
      const markerElement = document.createElement('img');
      markerElement.src = markerImage;
      markerElement.style.width = '26px';
      markerElement.style.height = '62.4px';
      return markerElement;
  }

  function createMarker(lngLat) {
    return new mapboxgl.Marker({
      color: "#666"
    }).setLngLat(lngLat).addTo(map);
  }
  
  document.getElementById("setStart").addEventListener("click", function () { // pag clinick mo yung origin button
    setMode("start");
    document.getElementById("popupstart").style.display = "block";
    document.getElementById("popupstart").textContent ="Pin on the map to set " + (settingStart ? "Origin" : "Destination");
    document.getElementById("successMessage").style.display = "none";
    
  });

  document.getElementById("setEnd").addEventListener("click", function () { // for detination button
    setMode("end");
    document.getElementById("popupstart").style.display = "block";
    document.getElementById("popupstart").textContent ="Pin on the map to set " + (settingStart ? "Origin" : "Destination");
    document.getElementById("successMessage").style.display = "none";
  });

  function clearEveryLayer() { 
    commonRouteIds.forEach(({ sourceId, layerId }) => {
      map.removeLayer(layerId);
      map.removeSource(sourceId);
    });
    commonRouteIds.length = 0;
    walkingLineIds.forEach(({ sourceId, layerId }) => {
      map.removeLayer(layerId);
      map.removeSource(sourceId);
    });
    walkingLineIds.length = 0;
    
  }

  document.getElementById("final").addEventListener("click", async function () { // for doing everything
    try {
      const resultContainer = document.getElementById("resultsContainer");
      resultContainer.innerHTML = "";


      markers.forEach(marker => marker.remove());
      markers.length = 0;
      clearEveryLayer();
      document.getElementById("popupstart").style.display = "none";
      if (!startMarker || !endMarker) {
        alert("Pin both origin and destination before finalizing.");
        return;
      }

      const startPinCoordinates = [ startMarker.getLngLat().lng, startMarker.getLngLat().lat,] // get coordinates
      const endPinCoordinates = [endMarker.getLngLat().lng,endMarker.getLngLat().lat,];
      console.log("ORIGINAL USER PIN:", startPinCoordinates, endPinCoordinates);

      const startResult = await getGeocodeResult(startPinCoordinates); // gives geocoded stuff 

      const startuserPin = { // geocoded results things
        lat: startResult.geometry.coordinates[1],
        lng: startResult.geometry.coordinates[0],
      };

      const endResult = await getGeocodeResult(endPinCoordinates);
      const enduserPin = {
        lat: endResult.geometry.coordinates[1],
        lng: endResult.geometry.coordinates[0],
      };

      console.log("GEOCODED USER PIN:", startuserPin, enduserPin);
      await compareAndDrawtheLines(startuserPin, enduserPin); 

      const addressPartsOrigin = startResult.place_name.split(",");
      const streetNameOrigin = addressPartsOrigin[0].trim();
      console.log(streetNameOrigin)

      const addressPartsDestination = endResult.place_name.split(",");
      const streetNameDestination= addressPartsDestination[0].trim();

      // Set geocodes to hidden form fields
      document.getElementById("startLatitude").value = startuserPin.lat; 
      document.getElementById("startLongitude").value = startuserPin.lng;
      document.getElementById("endLatitude").value = enduserPin.lat;
      document.getElementById("endLongitude").value = enduserPin.lng;
      document.getElementById("originAddress").value = streetNameOrigin
      document.getElementById("destinationAddress").value = streetNameDestination

      var loggedInUser = "<?php echo $loggedInUser; ?>";
      if (loggedInUser) {
        document.getElementById("saveGeocodesButton").style.display =
          "inline-block";
        document.getElementById("saveGeocodeForm").submit(); // ... for DBMS 
      }
    } catch (error) {
      console.error("Error during final click:", error);
    }
  });

  async function showAddress(lngLat, type) { // show address of pins 
    try {
      const pinCoordinates = [lngLat.lng, lngLat.lat];
      const result = await getGeocodeResult(pinCoordinates);
  
      if (result) {
        // Extract and format address
        const addressParts = result.place_name.split(",");
        const streetName = addressParts[0].trim();
  
        document.getElementById(`popAddress-${type}`).style.display = "inline-block";
        document.getElementById(`addressText-${type}`).textContent = streetName;
      } else {
        console.error(`Invalid geocoding result for ${type}`);
      }
    } catch (error) {
      console.error(`Error geocoding ${type}:`, error);
    }
  }
  
  async function getGeocodeResult(pinCoordinates) { // gives geocoded results like address, geocoded na pin n stuff 
    try {
      const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${pinCoordinates.join(",")}.json?access_token=${mapboxgl.accessToken}`;
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      return data.features ? data.features[0] : null;
    } catch (error) {
      console.error("Error fetching geocode result:", error);
      return null;
    }
  }

  function haversineDistance(coord1, coord2) { // use to calculate walking distance? idk chatgpt
    const R = 6371;
    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLng = toRadians(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(coord1.lat)) *
        Math.cos(toRadians(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers

    return distance * 1000; // Convert to meters
  }

  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  async function findClosestPointOnRoutes(coordinates,data) { // find the closest point on each route. Returns an array of sorted closest points 
    try {
      const polylineURLs = polylineInfo.map(info => info.url);
      const responses = await Promise.all(polylineURLs.map((url) => fetch(url)));
      const polylineDataArray = await Promise.all(responses.map((response) => response.json()));
  
      let closestPointsArray = [];
  
      polylineDataArray.forEach((data, index) => {
        const firstFeature = data.features[0];
  
        const polylineCoordinates = firstFeature.geometry.coordinates;
        const currentClosestPoint = findClosestPointOnLine(coordinates, polylineCoordinates); // finds the closespoint of each route from the pin
  
        if (currentClosestPoint) {
          currentClosestPoint.route = polylineURLs[index];
          closestPointsArray.push(currentClosestPoint); // puts the closespoint of each route on an array
        }

      });

      console.log("NEAREST JEEPNEY ROUTES OF PIN:", closestPointsArray);  
      if (closestPointsArray.length === 0) {
        console.error("No valid closest points found. boom");
        
        return null;
      }
  
      closestPointsArray.sort((a, b) => a.distance - b.distance); // sort points from nearest to farthest 
      
      const top3ClosestPoints = closestPointsArray.slice(0, data ); 

      return top3ClosestPoints;
    } catch (error) {
      console.error("Error loading polyline data:", error);
      return null;
    }
  }

  function findClosestPointOnLine(point, line) { // returns the closest points of each route 
    if (!point ||(!point.lat && point[1] === undefined) ||(!point.lng && point[0] === undefined) ||!Array.isArray(line) ||line.length === 0) {
      console.error(
        "Invalid coordinate or line array for findClosestPointOnLine:",point,line); return null;
    } 

    const closestPoint = line.reduce((acc, cur) => {
        const distance = haversineDistance(point, { lat: cur[1], lng: cur[0] }); // get distance

        if (distance < walkingThresholdinMeters) { // check if the distance is still within the walking threshold
          const currentPoint = { lat: cur[1], lng: cur[0], distance };
          return acc.distance < distance ? acc : currentPoint;
        }
        return acc;
      },
      { lat: line[0][1], lng: line[0][0], distance: Infinity }
    );

    return closestPoint.distance === Infinity ? null : closestPoint;
  }

  async function compareAndDrawtheLines(origin, destination) {
    try {
      const originClosestPoints = await findClosestPointOnRoutes(origin, numberOfClosestRoutes );
      const destinationClosestPoints = await findClosestPointOnRoutes(destination,numberOfClosestRoutes);
  
      if (!originClosestPoints || !destinationClosestPoints) {
        document.getElementById("messages").style.display = "inline-block";
        document.getElementById(`message`).textContent ="PINS ARE TOO FAR FROM AVAILABLE ROUTES ";
        return;
      }
  
      const originRoutes = originClosestPoints.map((point) => point.route);
      const destinationRoutes = destinationClosestPoints.map((point) => point.route);
      const commonRoutes1= findExactCommonRoutes(originRoutes, destinationRoutes);
  
      if (commonRoutes1.length > 0) {
        console.log(`Origin and destination share common routes: ${commonRoutes1.join(", ")}`);
  
        for (const commonRoute of commonRoutes1) {
          const originPoint = originClosestPoints.find((point) => point.route === commonRoute);
          const destinationPoint = destinationClosestPoints.find((point) => point.route === commonRoute);
          await drawWalkingLines(origin,originPoint , "start");
          await drawWalkingLines(destination,destinationPoint , "end");
          await drawJeepCommonRoute(commonRoute, originPoint, destinationPoint);
        }
      } else {

        console.log("Origin and destination do not have common routes. Checking stop points...");
  
        const stopPoints = await getStopPoints();
  
        if (stopPoints.length === 0) {
          console.error("No stop points found.");
          return;
        }
  
        for (const stopPointArray of stopPoints) {
          const stopPoint = {
            lat: stopPointArray[1],
            lng: stopPointArray[0],
          };
        
          console.log("STOP POINT:", stopPoint);
        
          const closestRoutePoints = await findClosestPointOnRoutes(stopPoint, howManyRoutes);
        
          const stopPointRoutes = closestRoutePoints.map((point) => point.route);
          const commonRoutes2 = findExactCommonRoutes(originRoutes,stopPointRoutes);
          const commonRoutes3 = findExactCommonRoutes(destinationRoutes,stopPointRoutes);

          console.log("Common Routes:", commonRoutes2, "3", commonRoutes3);
          
          if (commonRoutes2.length > 0) {
            console.log(`Stop point has common routes: ${commonRoutes2.join(", ")}`);
        
            for (const stopRoute of commonRoutes2) {
              const originPoint = originClosestPoints.find((point) => point.route === stopRoute);
              const StopPoint1 = closestRoutePoints.find((point) => point.route === stopRoute);
              console.log("this is everything: ",stopRoute, originPoint, StopPoint1)
              await drawWalkingLines(origin,originPoint , "start");
              
              await drawJeepCommonRoute(stopRoute, originPoint, StopPoint1 );
              const marker = createMarker({ lng: stopPoint.lng, lat: stopPoint.lat });
              markers.push(marker);
            }
          } else {
            console.log("Stop point does not have common routes.");
          }

          if (commonRoutes3.length > 0) {
          for (const stopRoute of commonRoutes3) {
            const destinationPoint = destinationClosestPoints.find((point) => point.route === stopRoute);
            const StopPoint2 = closestRoutePoints.find((point) => point.route === stopRoute);
            await drawWalkingLines(destination,destinationPoint , "end");
            console.log("this is everything: ",stopRoute, destinationPoint, StopPoint2)
            await drawJeepCommonRoute(stopRoute, StopPoint2, destinationPoint );
          }
        } else {
          console.log("Stop point does not have common routes.");
          }
        }
      }
    } catch (error) {
      console.error("Error during final click:", error);
    }
  }
  
  async function drawJeepCommonRoute(route, originClosestPoint, destinationClosestPoint) {
    try {

        document.getElementById("resultsContainer").style.display = "block";

        const response = await fetch(route);
        const data = await response.json();
        const routeInfo = polylineInfo.find(info => info.url === route);


        if (!data || !data.features || data.features.length === 0) {
            console.error(`Invalid polyline data for ${route}:`, data);
            return;
        }

        const firstFeature = data.features[0];

        if (!firstFeature.geometry || !firstFeature.geometry.coordinates) {
            console.error(`Invalid geometry in polyline data for ${route}:`, firstFeature.geometry);
            return;
        }

        const polylineCoordinates = firstFeature.geometry.coordinates;
        const overlappingPoints = getOverlappingPointsOfCompressedCircle(polylineCoordinates);

        const { indexOrigin, indexDestination } = findOptimalOriginAndDestinationPoints(polylineCoordinates, originClosestPoint, destinationClosestPoint, overlappingPoints);

        if (indexOrigin === null || indexDestination === null) {
            console.error(`Error finding closest points on ${route} for origin or destination.`);
            return;
        }

        const subsetCoordinates = calculateSubsetCoordinates(polylineCoordinates, indexOrigin, indexDestination);

        const segments = splitRouteCoordinates(subsetCoordinates);
        let overallDistance = 0;
        let overallDuration = 0;

        for (const segment of segments) {
            const response = await fetchMatchingAPI(segment);

            if (!response || !response.matchings ||response.matchings.length === 0) {
                console.error(`Invalid matching data for segment:`, data);
                continue;
            }

            const matching = response.matchings[0];
            const distanceOfSegment = matching.distance;
            const durationOfSegment = matching.duration;
            const coordinates = matching.geometry.coordinates;

            overallDistance += distanceOfSegment;
            overallDuration += durationOfSegment; 

            if (coordinates.length > 0) {

              const sourceId2 = "used-route-source-" + Date.now();
              const layerId2 = "used-route-layer-" + Date.now();
  
              commonRouteIds.push({ sourceId: sourceId2, layerId: layerId2 });
  
              map.addSource(sourceId2, {
                  type: "geojson",
                  data: {
                      type: "Feature",
                      properties: {},
                      geometry: {
                          type: "LineString",
                          coordinates: subsetCoordinates,
                      },
                  },
              });
  
              const routeInfo = polylineInfo.find(info => info.url === route);
              const routeColor = routeInfo.color;
              const routeWidth = routeInfo.width;
  
              map.addLayer({
                  id: layerId2,
                  type: "line",
                  source: sourceId2,
                  layout: {
                      "line-join": "round",
                      "line-cap": "round",
                  },
                  paint: {
                      "line-color": routeColor,
                      "line-width":  routeWidth,
                      "line-opacity": 0.8,
                  },
              });
          } else {
              console.error(`Subset coordinates are empty for ${route}. Skipping drawing for this pair.`);
          }
        }

        document.getElementById('jeepsAvailable').style.display = "block";
        document.getElementById('reminder').style.display = "block";
        displayResults(routeInfo, subsetCoordinates, overallDistance, overallDuration)
    } catch (error) {
        console.error(`Error drawing line connecting closest points for common route ${route}:`, error);
    }
  } 

  const fetchWalkingLines = async (startCoordinates, endCoordinates) => {  // to get walking lines
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoordinates.lng},${startCoordinates.lat};${endCoordinates.lng},${endCoordinates.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching walking lines: ${response.statusText}`);
      }
      const data = await response.json();

      if (data && data.code === "Ok" && data.routes && data.routes.length > 0) {
        const walkingLines = data.routes.map((route) => {
          return route.geometry.coordinates;
        });

        const distances = data.routes.map((route) => {
          return {
            duration: route.duration / 60, // Convert seconds to minutes
            distance: route.distance,
          };
        });

        return { walkingLines, distances };
      } else {
        console.error(
          "No routes found in the Walking Lines API response:",
          data
        );
        return null;
      }
    } catch (error) {
      console.error("Error fetching walking lines:", error);
      return null;
    }
  };

  async function drawWalkingLines(startCoordinates, endCoordinates, marker) { // walking lines from pin to closest points on routes
    try {
      const { walkingLines, distances } = await fetchWalkingLines(startCoordinates,endCoordinates);
        
      walkingLines.forEach((line, index) => {
        const sourceId = `${marker}-walking-line-source-${index}-${Math.random()}`;
        const layerId = `${marker}-walking-line-layer-${index}-${Math.random()}`;

        walkingLineIds.push({ sourceId, layerId });

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {
              duration: distances[index].duration,
              distance: distances[index].distance,
            },
            geometry: {
              type: "LineString",
              coordinates: line,
            },
          },
        });

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": marker === "start"? "#469904": marker === "end"? "#FF0000": "#0000FF",
            "line-width": 5,
            "line-dasharray": [1, 2],
          },
        });

        console.log(`Duration for Walking ${index + 1}: ${distances[index].duration} minutes`);
        console.log(`Distance for route ${index + 1}: ${distances[index].distance} meters`);
    
      });
    } catch (error) {
      console.error("Error drawing walking lines:", error);
    }
  }
    
  function findOptimalOriginAndDestinationPoints(route, originClosestPoint, destinationClosestPoint, overlappingPoints) {
    console.log("STOP POINT AND POINT", originClosestPoint,destinationClosestPoint)
    const originDontOverlap = !checkOverlappingPoints(originClosestPoint, overlappingPoints);
    const destinationDontOverlap = !checkOverlappingPoints(destinationClosestPoint, overlappingPoints);
    
    const originIndex = findPointIndex(route, originClosestPoint);
    const destinationIndex = findPointIndex(route, destinationClosestPoint);
    const alternativeDestination = findAlternativeIndex(destinationClosestPoint, overlappingPoints, route);
    const alternativeOrigin = findAlternativeIndex(originClosestPoint, overlappingPoints, route);
    
    if (originDontOverlap && destinationDontOverlap) {
        console.log("They don't overlap.");
        return { indexOrigin: originIndex, indexDestination: destinationIndex };

    } else if (originDontOverlap && !destinationDontOverlap) {
        console.log("Destination overlaps, finding alternative...");
        
        const findClosesRouteA = calculateSubsetCoordinates(route, originIndex,  destinationIndex)
        const findClosestRouteB = calculateSubsetCoordinates(route, originIndex, alternativeDestination)

        if (findClosesRouteA.length > findClosestRouteB.length){
          return {indexOrigin: originIndex, indexDestination: alternativeDestination}
        } else {
          return {indexOrigin: originIndex, indexDestination:  destinationIndex}
        }

    } else if (!originDontOverlap && destinationDontOverlap) {
      console.log("Origin overlaps, finding alternative...");
      
      const findClosesRouteA = calculateSubsetCoordinates(route, originIndex,  destinationIndex)
      const findClosestRouteB = calculateSubsetCoordinates(route, alternativeOrigin, destinationIndex)

        if (findClosesRouteA.length > findClosestRouteB.length){
          return { indexOrigin:  alternativeOrigin , indexDestination: destinationIndex};
        } else {
          return {indexOrigin: originIndex, indexDestination:  destinationIndex}
        }

  } else {
      console.log("Both origin and destination overlap with points on the route.");
  
      const findClosestRouteA = calculateSubsetCoordinates(route, originIndex, destinationIndex);
      const findClosestRouteB = calculateSubsetCoordinates(route, alternativeOrigin, destinationIndex);
      const findClosestRouteC = calculateSubsetCoordinates(route, originIndex, alternativeDestination);
      const findClosestRouteD = calculateSubsetCoordinates(route, alternativeOrigin, alternativeDestination);
  
      const lengths = {
          routeA: findClosestRouteA.length,
          routeB: findClosestRouteB.length,
          routeC: findClosestRouteC.length,
          routeD: findClosestRouteD.length
      };
  
      const shortestRouteLength = Math.min(...Object.values(lengths));
      const shortestRoute = Object.keys(lengths).find(key => lengths[key] === shortestRouteLength);
  
      if (shortestRoute === 'routeA') {
          return { indexOrigin: originIndex, indexDestination: destinationIndex };
      } else if (shortestRoute === 'routeB') {
          return { indexOrigin: alternativeOrigin, indexDestination: destinationIndex };
      } else if (shortestRoute === 'routeC') {
          return { indexOrigin: originIndex, indexDestination: alternativeDestination };
      } else {
          return { indexOrigin: alternativeOrigin, indexDestination: alternativeDestination };
      }
    }
  }

  function displayResults(routeInfo, subsetCoordinates, overallDistance, overallDuration, data) {
    const overalDistanceRounded = Math.round(overallDistance / 1000);
    const calculateFare = new FareCalculator(13, 4, 1, data);
    const calculateDiscountedFare = new FareCalculator(11, 4, 1);
    const fare = calculateFare .calculateJeepFare(overallDistance / 1000);
    const discountedFare = calculateDiscountedFare .calculateJeepFare(overallDistance / 1000);
  
    const resultContainer = document.getElementById("resultsContainer");
  
    const resultElement = document.createElement("div");
    resultElement.classList.add("result");
  
    const pinElement = document.createElement("img");
    pinElement.src = routeInfo ? routeInfo.pin : "";
  
    const routeInfoElement = document.createElement("x");
    routeInfoElement.textContent = `${routeInfo ? routeInfo.name : 'Unknown'}`;
  
    const distanceInfoElement = document.createElement("r");
    distanceInfoElement.textContent = `Distance:${overalDistanceRounded}km`;
  
    const durationInfoElement = document.createElement("z");
    durationInfoElement.textContent = `| Duration: ${Math.round(Number(overallDuration) / 60)}min`;
  
    const fareInfoElement = document.createElement("f");
    fareInfoElement.textContent = `Fare: PHP ${fare.toFixed(2)}`;

    const fareInfoElement2 = document.createElement("f");
    fareInfoElement2.textContent = `Discounted Fare: PHP ${discountedFare.toFixed(2)}`;
  
    resultElement.appendChild(pinElement);
    resultElement.appendChild(routeInfoElement);
    resultElement.appendChild(distanceInfoElement);
    resultElement.appendChild(durationInfoElement);
    resultElement.appendChild(fareInfoElement);
    resultElement.appendChild(fareInfoElement2);
    resultContainer.appendChild(resultElement);
  }

  function splitRouteCoordinates(route) {
    const segments = [];
    const numSegments = Math.ceil(route.length /99);

    for (let i = 0; i < numSegments; i++) {
        const startIdx = i * 99;
        const endIdx = (i + 1) * 99;
        const segment = route.slice(startIdx, endIdx);
        segments.push(segment);
    }

    return segments;
  }

  async function fetchMatchingAPI(segment) {
      try {
          const coordinates = segment.map(coord => `${coord[0]},${coord[1]}`).join(';');
          const response = await fetch(
              `https://api.mapbox.com/matching/v5/mapbox/driving-traffic/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`
          );

          if (!response.ok) {
              throw new Error(`Error fetching Map Matching API: ${response.statusText}`);
          }

          const data = await response.json();
          return data;
      } catch (error) {
          console.error(`Error fetching Map Matching API:`, error);
          return null;
      }
  }

  function findPointIndex(route, point) {
    for (let i = 0; i < route.length; i++) {
        const routePoint = route[i];
        if (routePoint[0] === point.lng || routePoint[1] === point.lat) {
            return i; // Return the index if the point is found
        }
    }
    return -1; // Return -1 if the point is not found
  }

  function checkOverlappingPoints(point, overlappingPoints) {
    console.log("Point:", point);
      for (const overlappingPointObj of overlappingPoints) {
          const overlappingPoint = overlappingPointObj.coordinate;
          if (point.lng === overlappingPoint[0] && point.lat === overlappingPoint[1]) {
              return true; // It overlaps
          }
      }
      return false; // It doesn't
  }

  function findAlternativeIndex(point, overlappingPoints, route) {
    for (const overlappingPointObj of overlappingPoints) {
        const overlappingPoint = overlappingPointObj.coordinate;
        if (point.lng === overlappingPoint[0] && point.lat === overlappingPoint[1]) {
            console.log("Matching point found.");
            console.log("similarCoordinateIndex:", overlappingPointObj.similarCoordinateIndex);
            return overlappingPointObj.similarCoordinateIndex;
        }
    }
    console.log("No matching point found.");
    return -1;
  }

  function getOverlappingPointsOfCompressedCircle(route) {
    const overlappingPoints = [];
  
    for (let i = 0; i < route.length; i++) {
      const currentCoordinate = route[i];
      for (let j = i + 1; j < route.length; j++) {
        const otherCoordinate = route[j];
  
        if (currentCoordinate[0] === otherCoordinate[0] && currentCoordinate[1] === otherCoordinate[1]) {
          overlappingPoints.push({
            coordinate: currentCoordinate,
            index: i,
            similarCoordinateIndex: j,
          });
        }
      }
    }
    return overlappingPoints;
  }

  function calculateSubsetCoordinates(polylineCoordinates, indexOrigin, indexDestination) {
    const subsetCoordinates = [];
    const maxSubsetLength = Infinity;

    // Validate indices
    if (indexOrigin < 0 || indexDestination < 0 || indexOrigin >= polylineCoordinates.length || indexDestination >= polylineCoordinates.length) {
        console.error("Error: Invalid indices");
        return subsetCoordinates;
    }

    if (indexDestination >= indexOrigin) {
        subsetCoordinates.push(...polylineCoordinates.slice(indexOrigin, indexDestination + 1));
    } else {
        subsetCoordinates.push(...polylineCoordinates.slice(indexOrigin), ...polylineCoordinates.slice(0, indexDestination + 1));
    }

    // Check if the subset is too long and there is more than one route
    if (subsetCoordinates.length > maxSubsetLength && polylineCoordinates.length > 2) {
        console.error("Error: Subset is too long");
        return [];
    }

    return subsetCoordinates;
  }

  function findExactCommonRoutes(route1, route2) { //
    const arrayify = (value) => (Array.isArray(value) ? value : [value]);

    const set1 = new Set(arrayify(route1));
    const set2 = new Set(arrayify(route2));

    const uniqueCommonRoutes = new Set([...set1].filter(route => set2.has(route)));

    return [...uniqueCommonRoutes];
  }

  async function getStopPoints() {
    try {
      const response = await fetch("http://localhost/Karipas/Karipas%20Cult/RoutesPoly/StopPoints.json");
      const data = await response.json();
      return data.features.map(feature => feature.geometry.coordinates);
    } catch (error) {
      console.error("Error during getStopPoints:", error);
      return [];
    }
  }

  const routeAgainButtons = document.querySelectorAll('.route-again-btn');
    routeAgainButtons.forEach(button => {
      document.getElementById("setStart").style.display = "none";
          document.getElementById("setEnd").style.display = "none";
          document.getElementById("final").style.display = "none";
          document.getElementById("refresh").style.display = "none";
          document.getElementById("popAddress-start").style.display = "none";
          document.getElementById("popAddress-end").style.display = "none";
      
        button.addEventListener('click', function () {
          
            const startLat = this.dataset.startLat;
            const startLng = this.dataset.startLng;
            const endLat = this.dataset.endLat;
            const endLng = this.dataset.endLng;
            const resultContainer = document.getElementById("resultsContainer");
            resultContainer.innerHTML = "";
            document.getElementById("popupstart").style.display = "none";
            markers.forEach(marker => marker.remove());
            markers.length = 0;
            clearEveryLayer();

            // Call the JavaScript function to handle routing with these coordinates
            routeAgain(startLat, startLng, endLat, endLng);
        });
    });

    async function routeAgain(startLat, startLng, endLat, endLng) {
        const startPinCoordinates = combineCoordinates(startLat, startLng);
        const endPinCoordinates = combineCoordinates(endLat, endLng);

        console.log('Combined Coordinates:', startPinCoordinates, endPinCoordinates);
        const startResult = await getGeocodeResult(startPinCoordinates);
        const endResult = await getGeocodeResult(endPinCoordinates);
        console.log(startResult,endResult)
        const startuserPin = {
            lat: startResult.geometry.coordinates[1],
            lng: startResult.geometry.coordinates[0],
        };

        const enduserPin = {
            lat: endResult.geometry.coordinates[1],
            lng: endResult.geometry.coordinates[0],
        };

        console.log("GEOCODED USER PIN:", startuserPin, enduserPin);
        await compareAndDrawtheLines(startuserPin, enduserPin);
        const marker2 = createMarker(startuserPin);
        const marker3 = createMarker(enduserPin);
        markers.push(marker2);
        markers.push(marker3);
    }
    function combineCoordinates(lat, lng) {
        return [parseFloat(lng), parseFloat(lat)]; // Combine latitude and longitude
    }
});

class FindClosestPoints{

}
class JeepLines{

}
class OverlappingPoints {
  
}
class WalkingLines{
  
}

class FareCalculator {
  constructor(baseFare, initialDistance, perKm) {
    this.baseFare = baseFare;
    this.initialDistance = initialDistance;
    this.perKm = perKm;
  }

  calculateJeepFare(distanceInKm) {
    const calculatedFare = this.baseFare + (distanceInKm - this.initialDistance) * this.perKm;
    
    if (calculatedFare < this.baseFare) {
      return this.baseFare;
    } else {
      return Math.round(calculatedFare * 4.0) / 4.0; // Round to the nearest 0.25 PHP
    }
  }
}
