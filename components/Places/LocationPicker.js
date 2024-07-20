/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { View, StyleSheet, Alert, Image, Text } from "react-native";
import {
  getCurrentPositionAsync,
  useForegroundPermissions,
  PermissionStatus,
} from "expo-location";

import OutlinedButton from "../UI/OutlinedButton";
import { Colors } from "../../constants/colors";
import { getAddress, getMapPreview } from "../../util/location";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";

function LocationPicker({ onPickLocation }) {
  const [pickedLocation, setPickedLocation] = useState();
  const isFocused = useIsFocused();

  const [locationPermissionInformation, requestPermission] =
    useForegroundPermissions();

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    (async () => {
      try {
        if (
          locationPermissionInformation &&
          locationPermissionInformation.status === PermissionStatus.UNDETERMINED
        ) {
          await requestPermission();
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [locationPermissionInformation, requestPermission]);

  useEffect(() => {
    if (isFocused && route.params) {
      const mapPickedLocation = route.params && {
        lat: route.params.pickedLat,
        lng: route.params.pickedLng,
      };
      setPickedLocation(mapPickedLocation);
    }
  }, [route, isFocused]);

  useEffect(() => {
    async function handleLocation() {
      try {
        if (pickedLocation) {
          const address = await getAddress(
            pickedLocation.lat,
            pickedLocation.lng
          );
          onPickLocation({ ...pickedLocation, address });
        }
      } catch (error) {
        console.log(error);
      }
    }

    handleLocation();
  }, [pickedLocation, onPickLocation]);

  async function verifyPermissions() {
    try {
      if (!locationPermissionInformation) {
        return false;
      }

      if (
        locationPermissionInformation.status ===
          PermissionStatus.UNDETERMINED ||
        locationPermissionInformation.canAskAgain
      ) {
        const permissionResponse = await requestPermission();

        return permissionResponse.granted;
      }

      if (locationPermissionInformation.status === PermissionStatus.DENIED) {
        const permissionResponse = await requestPermission();

        if (permissionResponse.granted) return true;

        Alert.alert(
          "Insufficient permissions",
          // eslint-disable-next-line prettier/prettier
          "You need to grant location permissions to use this app"
        );

        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
    }
  }

  async function getLocationHandler() {
    try {
      const hasPermission = await verifyPermissions();

      if (!hasPermission) {
        return;
      }
      const location = await getCurrentPositionAsync();
      setPickedLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.log(error);
    }
  }

  function pickOnMapHandler() {
    navigation.navigate("Map");
  }

  let locationPreview = <Text>No location picked yet.</Text>;

  if (pickedLocation) {
    locationPreview = (
      <Image
        style={styles.image}
        source={{ uri: getMapPreview(pickedLocation.lat, pickedLocation.lng) }}
      />
    );
  }

  return (
    <View>
      <View style={styles.mapPreview}>{locationPreview}</View>
      <View style={styles.actions}>
        <OutlinedButton icon="location" onPress={getLocationHandler}>
          Locate User
        </OutlinedButton>
        <OutlinedButton icon="map" onPress={pickOnMapHandler}>
          Pick on Map
        </OutlinedButton>
      </View>
    </View>
  );
}

export default LocationPicker;

const styles = StyleSheet.create({
  mapPreview: {
    width: "100%",
    height: 200,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    borderRadius: 4,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
});
