import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Home, History, User } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getDatabase, ref, onValue } from "firebase/database";

type RootStackParamList = {
  FindOutletPage: undefined;
  OrderHistoryPage: undefined;
  IndCustHomePage: undefined;
  IndCustProfile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "FindOutletPage">;

interface OutletData {
  outletName: string;
  outletManagerName: string;
  phoneNumber: string;
  outletAddress: string;
}

const FindOutletPage: React.FC<Props> = ({ navigation }) => {
  const [outlets, setOutlets] = useState<OutletData[]>([]);

  // Fetch data from Firebase Realtime Database
  useEffect(() => {
    const fetchData = () => {
      const db = getDatabase();
      const outletRef = ref(db, "gasOutletsReg"); // Path to the "gasOutletsReg" node

      onValue(outletRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const outletList = Object.keys(data).map((key) => ({
            outletName: data[key].outletName,
            outletManagerName: data[key].outletManagerName,
            phoneNumber: data[key].phoneNumber,
            outletAddress: data[key].outletAddress,
          }));
          setOutlets(outletList); // Update state with the transformed data
        }
      });
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Gas Outlets</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search outlets by name"
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Outlets List */}
      <ScrollView style={styles.scrollView}>
        {outlets.map((outlet, index) => (
          <View key={index} style={styles.outletCard}>
            <View style={styles.outletHeader}>
              <Text style={styles.outletName}>{outlet.outletName}</Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📍 Address:</Text>
                <Text style={styles.detailText}>{outlet.outletAddress}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>👨‍💼 Manager:</Text>
                <Text style={styles.detailText}>{outlet.outletManagerName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📞 Contact:</Text>
                <Text style={styles.detailText}>{outlet.phoneNumber}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => navigation.navigate("OrderHistoryPage")}
            >
              <Text style={styles.requestButtonText}>Request Cylinder</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("IndCustHomePage")}
        >
          <Home color="#2563EB" size={20} />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("OrderHistoryPage")}
        >
          <History color="#6B7280" size={20} />
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("IndCustProfile")}
        >
          <User color="#6B7280" size={20} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2563eb",
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  outletCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  outletName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    color: "#666",
  },
  detailText: {
    flex: 1,
    color: "#333",
  },
  requestButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  requestButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
});

export default FindOutletPage;