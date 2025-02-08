import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from '@expo/vector-icons';

type RootStackParamList = {
  UserTypePage: undefined;
  IndCustLogPage: undefined;
  OrgLogPage: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "UserTypePage">;

const UserTypeSelection: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="fire" size={50} color="#ff6600" />
          <Text style={styles.title}>GasByGas</Text>
        </View>
        <Text style={styles.subtitle}>Select Your User Type</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate("IndCustLogPage")}
          >
            <FontAwesome5 name="user" size={40} color="#ff6600" style={styles.buttonIcon} />
            <Text style={styles.buttonTitle}>Individual Customer</Text>
            <Text style={styles.buttonSubtext}>For personal gas cylinder needs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate("OrgLogPage")}
          >
            <FontAwesome5 name="building" size={40} color="#ff6600" style={styles.buttonIcon} />
            <Text style={styles.buttonTitle}>Organization</Text>
            <Text style={styles.buttonSubtext}>For business and bulk orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF3E0", // Light orange background
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  formContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#ff6600",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 20,
  },
  button: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
    textAlign: "center",
  },
  buttonSubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default UserTypeSelection;