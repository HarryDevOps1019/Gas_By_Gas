import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, get, child } from "firebase/database";
import { RouteProp } from "@react-navigation/native";

type OrganizationDetails = {
    orgName: string;
    busiRegNo: string;
    address: string;
    email: string;
    orgPhoneNumber: string;
};

type RootStackParamList = {
    OrgProfile: { orgPrimaryKey: string };
};

type OrgProfileRouteProp = RouteProp<RootStackParamList, "OrgProfile">;

interface OrgProfileProps {
    route: OrgProfileRouteProp;
}

const OrgProfile: React.FC<OrgProfileProps> = ({ route }: OrgProfileProps) => {
    const { orgPrimaryKey } = route.params;

    const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchOrgDetails = async () => {
          try {
              console.log("Fetching details for orgPrimaryKey:", orgPrimaryKey);
  
              const dbRef = ref(rtdb);
              const orgRef = child(dbRef, `OrganizationRegistration/${orgPrimaryKey}`);
  
              const snapshot = await get(orgRef);
              console.log("Firebase snapshot:", snapshot.val());
  
              if (snapshot.exists()) {
                  setOrgDetails(snapshot.val() as OrganizationDetails);
              } else {
                  console.log("No data found for organization key:", orgPrimaryKey);
                  Alert.alert("Error", "Organization details not found.");
              }
          } catch (error) {
              console.error("Error fetching organization details:", error);
              Alert.alert("Error", "Failed to fetch organization details. Try again later.");
          } finally {
              setLoading(false);
          }
      };
  
      fetchOrgDetails();
  }, [orgPrimaryKey]);
  

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading organization details...</Text>
            </View>
        );
    }

    if (!orgDetails) {
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
                <Text style={styles.value}>{orgDetails.orgName}</Text>

                <Text style={styles.label}>Business Registration No:</Text>
                <Text style={styles.value}>{orgDetails.busiRegNo}</Text>

                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{orgDetails.address}</Text>

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{orgDetails.email}</Text>

                <Text style={styles.label}>Phone Number:</Text>
                <Text style={styles.value}>{orgDetails.orgPhoneNumber}</Text>
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

export default OrgProfile;