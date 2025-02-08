import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, get, child } from "firebase/database";
import { RouteProp } from "@react-navigation/native";


type IndCustDetails = {
    name: string;
    nic: string;
    address: string;
    email: string;
    phoneNumber: string;
};

type RootStackParamList = {
  IndCustProfile: { custPrimaryKey: string };
};

type CustProfileRouteProp = RouteProp<RootStackParamList, "IndCustProfile">;

interface CustProfileProps {
    route: CustProfileRouteProp;
}

const IndCustProfile: React.FC<CustProfileProps> = ({ route }: CustProfileProps) => {
    const { custPrimaryKey } = route.params;

    const [custDetails, setCustDetails] = useState<IndCustDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchCustDetails = async () => {
          try {
              console.log("Fetching details for custPrimaryKey:", custPrimaryKey);
  
              const dbRef = ref(rtdb);
              const orgRef = child(dbRef, `CustomerRegistration/${custPrimaryKey}`);
  
              const snapshot = await get(orgRef);
              console.log("Firebase snapshot:", snapshot.val());
  
              if (snapshot.exists()) {
                setCustDetails(snapshot.val() as IndCustDetails);
              } else {
                  console.log("No data found for customer key:", custPrimaryKey);
                  Alert.alert("Error", "Customer details not found.");
              }
          } catch (error) {
              console.error("Error fetching customer details:", error);
              Alert.alert("Error", "Failed to fetch customer details. Try again later.");
          } finally {
              setLoading(false);
          }
      };
  
      fetchCustDetails();
  }, [custPrimaryKey]);
  

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading organization details...</Text>
            </View>
        );
    }

    if (!custDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No organization details available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Organization Profile</Text>
            <View style={styles.detailsContainer}>
                <Text style={styles.label}>Organization Name:</Text>
                <Text style={styles.value}>{custDetails.name}</Text>

                <Text style={styles.label}>Business Registration No:</Text>
                <Text style={styles.value}>{custDetails.nic}</Text>

                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{custDetails.address}</Text>

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{custDetails.email}</Text>

                <Text style={styles.label}>Phone Number:</Text>
                <Text style={styles.value}>{custDetails.phoneNumber}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    detailsContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        elevation: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        color: "gray",
    },
    errorText: {
        color: "red",
        fontSize: 16,
        textAlign: "center",
    },
});

export default IndCustProfile;