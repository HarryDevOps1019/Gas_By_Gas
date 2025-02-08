import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Home, Package, History, User, MapPin, Calendar, Hash } from "lucide-react-native";
import { app } from "../Services/firebase";
import { getDatabase, ref, onValue } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  OrgHomePage: undefined;
  OrgGasReqForm: undefined;
  FindOutletPage: undefined;
  OrgOrderHistory: undefined;
  OrgProfile: { orgPrimaryKey: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "OrgHomePage">;

const OrgHomePage: React.FC<Props> = ({ navigation }) => {
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const db = getDatabase(app);
        // Fetch the current organization's busiRegNo
        const orgEmail = "organization@example.com"; // Replace with the logged-in user's email
        const orgPassword = "password123"; // Replace with the logged-in user's password

        const orgRef = ref(db, "OrganizationRegistration");
        onValue(orgRef, (snapshot) => {
          let busiRegNo = "";
          snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            if (childData.email === orgEmail && childData.password === orgPassword) {
              busiRegNo = childSnapshot.key || "";
            }
          });

          if (busiRegNo) {
            // Fetch the token details for the matching busiRegNo
            const tokenRef = ref(db, `tokens`);
            onValue(tokenRef, (snapshot) => {
              snapshot.forEach((childSnapshot) => {
                const childData = childSnapshot.val();
                if (childData.busiRegNo === busiRegNo) {
                  setToken(childData);
                  setLoading(false);
                }
              });

              if (!token) {
                Alert.alert("Error", "No token data found for this organization.");
                setLoading(false);
              }
            });
          } else {
            Alert.alert("Error", "Invalid email or password.");
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("Error fetching token data: ", error);
        Alert.alert("Error", "Failed to fetch token data. Try again later.");
        setLoading(false);
      }
    };

    fetchTokenData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.loading}>
        <Text>No data found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>GasByGas</Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Enhanced Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Requested Gas Pickup Details</Text>
              <Text style={styles.cardSubtitle}>
                {new Date(token.createdAt).toLocaleDateString() || "yyyy-mm-dd"}
              </Text>
            </View>
            <Calendar color="#2563EB" size={24} />
          </View>

          {/* Cylinder Details */}
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
                  token.status === "Approved"
                    ? styles.statusConfirmed
                    : styles.statusPending,
                ]}
              >
                {token.status || "Pending"}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("OrgGasReqForm")}
          >
            <Package color="#FFFFFF" size={24} />
            <Text style={styles.actionText}>Request Gas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.findOutlet]}
            onPress={() => navigation.navigate("FindOutletPage")}
          >
            <MapPin color="#2563EB" size={24} />
            <Text style={[styles.actionText, { color: "#2563EB" }]}>Find Gas Outlet</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navButton}>
            <Home color="#2563EB" size={20} />
            <Text style={styles.navTextActive}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate("OrgOrderHistory")}
          >
            <History color="#6B7280" size={20} />
            <Text style={styles.navText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() =>
              navigation.navigate("OrgProfile", { orgPrimaryKey: token.busiRegNo })
            }
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
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#2563EB",
    padding: 20,
    alignItems: "center",
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#111827",
    marginLeft: 8,
  },
  details: {
    marginTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 8,
  },
  statusConfirmed: {
    color: "#22C55E",
  },
  statusPending: {
    color: "#F59E0B",
  },
  statusCompleted: {
    color: "#10B981",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  findOutlet: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#6B7280",
  },
  navTextActive: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "bold",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});

export default OrgHomePage;