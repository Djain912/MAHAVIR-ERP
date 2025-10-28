import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getStoredUser, logout } from '../services/authService';
import { getActiveDispatch } from '../services/dispatchService';
import { getDriverStats } from '../services/cashCollectionService';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getStoredUser();
      setUser(userData);

      if (userData) {
        // Fetch active dispatch
        try {
          const dispatchData = await getActiveDispatch(userData._id);
          setActiveDispatch(dispatchData.data);
        } catch (error) {
          console.log('No active dispatch found');
          setActiveDispatch(null);
        }

        // Fetch driver stats
        try {
          const statsData = await getDriverStats(userData._id);
          setStats(statsData.data);
        } catch (error) {
          console.log('Error loading stats');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleSubmitCash = () => {
    if (!activeDispatch) {
      Alert.alert('No Active Dispatch', 'You need an active dispatch to submit cash collection.');
      return;
    }
    navigation.navigate('CashCollection', { dispatch: activeDispatch });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
      <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#000000']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Active Dispatch Card */}
      {activeDispatch ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Active Dispatch</Text>
            <View style={[styles.badge, styles.badgeActive]}>
              <Text style={styles.badgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.dispatchInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(activeDispatch.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stock Value:</Text>
              <Text style={styles.infoValue}>
                ₹{activeDispatch.totalStockValue?.toLocaleString() || '0'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cash Given:</Text>
              <Text style={styles.infoValue}>
                ₹{activeDispatch.totalCashValue?.toLocaleString() || '0'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.noDispatchText}>No Active Dispatch</Text>
          <Text style={styles.noDispatchSubtext}>
            Contact admin to assign a new dispatch
          </Text>
        </View>
      )}

      {/* Statistics Card */}
      {stats && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalCollections || 0}</Text>
              <Text style={styles.statLabel}>Total Collections</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹{(stats.totalCashCollected || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Cash Collected</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: stats.totalVariance < 0 ? '#DC2626' : '#16A34A' }]}>
                ₹{(stats.totalVariance || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Variance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.verified || 0}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, !activeDispatch && styles.disabledButton]}
          onPress={handleSubmitCash}
          disabled={!activeDispatch}
        >
          <Text style={styles.actionButtonText}>💰 Submit Cash Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('CollectionHistory')}
        >
          <Text style={styles.actionButtonText}>📋 View History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#6B7280',
    fontSize: 14,
    opacity: 0.95,
    fontFamily: 'Inter',
  },
  userName: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  logoutButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
  },
  dispatchInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  noDispatchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  noDispatchSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    fontFamily: 'Inter',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  actionContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#000000',
  },
  secondaryButton: {
    backgroundColor: '#F43F5E',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
