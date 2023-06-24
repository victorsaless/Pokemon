import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PokemonDetails"
          component={PokemonDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  const [pokemonData, setPokemonData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favoritePokemon, setFavoritePokemon] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    async function fetchPokemonData() {
      try {
        const response = await axios.get(
          "https://pokeapi.co/api/v2/pokemon/?limit=20"
        );
        const { results } = response.data;
        const pokemonArray = await Promise.all(
          results.map(async (pokemon) => {
            const pokemonResponse = await axios.get(pokemon.url);
            return pokemonResponse.data;
          })
        );

        const filteredPokemonArray = pokemonArray.filter((pokemon) =>
          pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setPokemonData(filteredPokemonArray);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
      }
    }

    fetchPokemonData();
  }, [searchTerm]);

  const handleSearch = (text) => {
    setSearchTerm(text);
  };

  const toggleFavoritePokemon = (pokemon) => {
    if (favoritePokemon.includes(pokemon)) {
      setFavoritePokemon(
        favoritePokemon.filter((favPokemon) => favPokemon !== pokemon)
      );
    } else {
      setFavoritePokemon([...favoritePokemon, pokemon]);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePokemonDetails = (pokemon) => {
    setSelectedPokemon(pokemon);
    navigation.navigate("PokemonDetails");
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>Lista de Pokémon</Text>
        <TouchableOpacity onPress={handleOpenModal} style={styles.navButton}>
          <Text style={styles.navButtonText}>Favoritos</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar Pokémon"
          onChangeText={handleSearch}
          value={searchTerm}
        />
      </View>
      <ScrollView contentContainerStyle={styles.cardContainer}>
        {pokemonData.map((pokemon, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handlePokemonDetails(pokemon)}
          >
            <Image
              style={styles.pokemonImage}
              source={{ uri: pokemon.sprites.front_default }}
            />
            <Text style={styles.pokemonName}>{pokemon.name}</Text>
            <View style={styles.pokemonTypes}>
              {pokemon.types.map((type, index) => (
                <Text key={index} style={styles.pokemonType}>
                  {type.type.name}
                </Text>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => toggleFavoritePokemon(pokemon)}
              style={[
                styles.favoriteButton,
                favoritePokemon.includes(pokemon) &&
                  styles.favoriteButtonActive,
              ]}
            >
              <Icon
                name={favoritePokemon.includes(pokemon) ? "star" : "star-o"}
                size={20}
                color={favoritePokemon.includes(pokemon) ? "#FFF" : "#E3350D"}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Pokémon Favoritos</Text>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {favoritePokemon.map((pokemon, index) => (
              <TouchableOpacity
                key={index}
                style={styles.favoritePokemonItem}
                onPress={() => setSelectedPokemon(pokemon)}
              >
                <Text style={styles.favoritePokemonName}>{pokemon.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            onPress={handleCloseModal}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function PokemonDetailsScreen({ route }) {
  const { pokemon } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navButton}
        >
          <Icon name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{pokemon.name}</Text>
        <TouchableOpacity style={styles.navButton} />
      </View>
      <View style={styles.pokemonDetailsContainer}>
        <Image
          style={styles.pokemonDetailsImage}
          source={{ uri: pokemon.sprites.front_default }}
        />
        <Text style={styles.pokemonDetailsName}>{pokemon.name}</Text>
        <View style={styles.pokemonDetailsTypes}>
          {pokemon.types.map((type, index) => (
            <Text key={index} style={styles.pokemonDetailsType}>
              {type.type.name}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

function FavoritesScreen({ navigation }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navButton}
        >
          <Icon name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Pokémon Favoritos</Text>
        <TouchableOpacity style={styles.navButton} />
      </View>
      <ScrollView contentContainerStyle={styles.favoriteContainer}>
        {favoritePokemon.map((pokemon, index) => (
          <TouchableOpacity
            key={index}
            style={styles.favoritePokemonItem}
            onPress={() => setSelectedPokemon(pokemon)}
          >
            <Text style={styles.favoritePokemonName}>{pokemon.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 16,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E3350D",
    textAlign: "center",
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#E3350D",
  },
  navButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: "#E3350D",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  cardContainer: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pokemonImage: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 8,
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  pokemonTypes: {
    flexDirection: "row",
    justifyContent: "center",
  },
  pokemonType: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#E3350D",
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3350D",
  },
  favoriteButtonActive: {
    backgroundColor: "#E3350D",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#FFF",
    textAlign: "center",
  },
  modalContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  favoritePokemonItem: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoritePokemonName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: "#E3350D",
    borderRadius: 8,
    padding: 16,
    alignSelf: "center",
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  pokemonDetailsContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  pokemonDetailsImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  pokemonDetailsName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#E3350D",
    textAlign: "center",
  },
  pokemonDetailsTypes: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  pokemonDetailsType: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#E3350D",
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 4,
  },
  favoriteContainer: {
    flexGrow: 1,
    paddingVertical: 16,
  },
});
