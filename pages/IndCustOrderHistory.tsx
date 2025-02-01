import React from "react";
import {View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity,} from "react-native";
import {Home, History, User,} from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack"; // Import for typing navigation

type RootStackParamList = {
    IndCustHomePage: undefined;
    IndCustOrderHistory: undefined;
    IndCustProfile: undefined;
};


type Props = NativeStackScreenProps<RootStackParamList, "IndCustOrderHistory">;

const IndCustOrderHistory: React.FC<Props> = ({ navigation }) => {
  const orders = [
    {
      id: '1',
      outletName: 'City Gas Center',
      cylinderType: '12.5kg Domestic',
      count: 2,
      receivedDate: '2024-01-20',
      status: 'Completed'
    },
    {
      id: '2',
      outletName: 'Metro Gas Point',
      cylinderType: '37.5kg Commercial',
      count: 1,
      receivedDate: '2024-01-15',
      status: 'Completed'
    },
    {
      id: '3',
      outletName: 'Express Gas Hub',
      cylinderType: '12.5kg Domestic',
      count: 1,
      receivedDate: '2024-01-10',
      status: 'Completed'
    },
    {
      id: '4',
      outletName: 'Central Gas Store',
      cylinderType: '5kg Portable',
      count: 3,
      receivedDate: '2024-01-05',
      status: 'Completed'
    },
    {
        id: '5',
        outletName: 'Batti Gas Store',
        cylinderType: '2.3kg Portable',
        count: 1,
        receivedDate: '2024-01-02',
        status: 'Completed'
      }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>History</Text>
      </View>

      {/* Sub Header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>Order History</Text>
        <Text style={styles.subHeaderCount}>{orders.length} orders</Text>
      </View>

      {/* Order List */}
      <ScrollView style={styles.scrollView}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.outletName}>{order.outletName}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cylinder Type:</Text>
                <Text style={styles.detailText}>{order.cylinderType}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantity:</Text>
                <Text style={styles.detailText}>{order.count} cylinder{order.count > 1 ? 's' : ''}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Received Date:</Text>
                <Text style={styles.detailText}>{order.receivedDate}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.navbar}>
        <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate("IndCustHomePage")}>
          <Home color="#2563EB" size={20} />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <History color="#6B7280" size={20} />
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate("IndCustProfile")}>
          <User color="#6B7280" size={20} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  subHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subHeaderCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  scrollView: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  outletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 2,
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
  button: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default IndCustOrderHistory;