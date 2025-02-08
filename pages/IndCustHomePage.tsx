import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { Calendar, Package, Hash, Home, History, User } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase, ref, get, query, orderByChild, equalTo } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  IndCustHomePage: undefined;
  IndCustGasReqForm: undefined;
  FindOutletPage: undefined;
  IndCustOrderHistory: undefined;
  IndCustProfile: { orgPrimaryKey: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "IndCustHomePage">;

const IndCustHomePage: React.FC<Props> = ({ navigation }) => {
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTokenDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const userEmail = await AsyncStorage.getItem("userEmail");

        if (!userEmail) {
          throw new Error("User email not found. Please log in again.");
        }

        console.log("Retrieved user email:", userEmail); // Debugging log

        const db = getDatabase();
        const customerRef = query(ref(db, "CustomerRegistration"), orderByChild("email"), equalTo(userEmail));
        const customerSnapshot = await get(customerRef);

        if (!customerSnapshot.exists()) throw new Error("Customer not found.");

        let nic: string | null = null;
        customerSnapshot.forEach((childSnapshot) => {
          nic = childSnapshot.key;
        });

        if (!nic) throw new Error("NIC not found for the given email.");

        const tokenRef = query(ref(db, "tokens"), orderByChild("nic"), equalTo(nic));
        const tokenSnapshot = await get(tokenRef);

        if (!tokenSnapshot.exists()) throw new Error("No token details found.");

        let tokenData: any = null;
        tokenSnapshot.forEach((childSnapshot) => {
          tokenData = childSnapshot.val();
        });

        setToken(tokenData);
      } catch (err: any) {
        console.error("Error fetching token details:", err.message);
        setError(err.message || "An error occurred.");
        Alert.alert("Error", err.message); // Show alert to the user
      } finally {
        setLoading(false);
      }
    };

    fetchTokenDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>GasByGas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {token ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Requested Gas Pickup Details</Text>
                <Text style={styles.cardSubtitle}>
                  {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : "yyyy-mm-dd"}
                </Text>
              </View>
              <Calendar color="#2563EB" size={24} />
            </View>

            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.infoText}>Token</Text>
                <Text style={styles.detailValue}>{token.token}</Text>
              </View>

              <View style={styles.detailRow}>
                <Package color="#6B7280" size={16} />
                <Text style={styles.infoText}>Cylinder Type</Text>
                <Text style={styles.detailValue}>{token.cylinderType}</Text>
              </View>

              <View style={styles.detailRow}>
                <Hash color="#6B7280" size={16} />
                <Text style={styles.infoText}>Cylinder Count</Text>
                <Text style={styles.detailValue}>{token.cylinderCount}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.status}>
                  <View style={styles.statusDot} />
                  <Text style={styles.infoText}>Pickup</Text>
                </View>
                <Text
                  style={[
                    styles.detailValue,
                    token.status === "Approved" ? styles.statusConfirmed : styles.statusPending,
                  ]}
                >
                  {token.status || "Pending"}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No active token found.</Text>
        )}

        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navButton}>
            <Home color="#2563EB" size={20} />
            <Text style={styles.navTextActive}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("IndCustOrderHistory")}>
            <History color="#6B7280" size={20} />
            <Text style={styles.navText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate("IndCustProfile", { orgPrimaryKey: token?.busiRegNo })}
          >
            <User color="#6B7280" size={20} />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { backgroundColor: "#2563EB", padding: 20, alignItems: "center" },
  headerText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  content: { padding: 20 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 8, padding: 16, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cardSubtitle: { fontSize: 16, color: "#6B7280" },
  details: { marginTop: 10 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  infoText: { fontSize: 14, color: "#111827", marginLeft: 8 },
  detailValue: { fontSize: 15, fontWeight: "bold", color: "#111827" },
  status: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B", marginRight: 6 },
  statusConfirmed: { color: "#22C55E" },
  statusPending: { color: "#F59E0B" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  noDataText: { fontSize: 16, color: "#6B7280", textAlign: "center", marginTop: 20 },
  navbar: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#FFFFFF", paddingVertical: 12 },
  navButton: { alignItems: "center" },
  navText: { fontSize: 12, color: "#6B7280", fontWeight: "bold" },
  navTextActive: { fontSize: 12, color: "#2563EB", fontWeight: "bold" },
});

export default IndCustHomePage;