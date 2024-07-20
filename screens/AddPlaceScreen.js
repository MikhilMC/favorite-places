// import { StyleSheet } from "react-native";
import PlaceForm from "../components/Places/PlaceForm";
import { insertPlace } from "../util/database";

function AddPlaceScreen({ navigation }) {
  async function createPlaceHandler(place) {
    try {
      await insertPlace(place);
      navigation.navigate("AllPlaces");
    } catch (error) {
      console.log(error);
    }
  }

  return <PlaceForm onCreatePlace={createPlaceHandler} />;
}

export default AddPlaceScreen;

// const styles = StyleSheet.create({});
