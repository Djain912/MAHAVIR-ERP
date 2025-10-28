import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { getStoredUser } from '../services/authService';
import { getDriverCollections } from '../services/cashCollectionService';

export default function CollectionHistoryScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [collections, setCollections] = useState([]);
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
        const response = await getDriverCollections(userData._id);
        setCollections(response.data || []);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusBadge = (status) => {
    const styles = {
      Submitted: { bg: '#FEF3C7', color: '#92400E' },
      Verified: { bg: '#DBEAFE', color: '#1E40AF' },
      Reconciled: { bg: '#DCFCE7', color: '#166534' },
    };

    const style = styles[status] || styles.Submitted;

    return (
      <View style={[badgeStyles.badge, { backgroundColor: style.bg }]}>
        <Text style={[badgeStyles.text, { color: style.color }]}>{status}</Text>
      </View>
    );
  };

  const getVarianceColor = (variance) => {
    if (variance === 0) return '#16A34A';
    if (Math.abs(variance) < 100) return '#F59E0B';
    return '#DC2626';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => navigation.navigate('CollectionDetails', { collectionId: item._id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>
          {new Date(item.collectionDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        {getStatusBadge(item.status)}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.amountRow}>
          <Text style={styles.label}>Expected:</Text>
          <Text style={styles.value}>₹{item.expectedCash?.toLocaleString() || '0'}</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.label}>Collected:</Text>
          <Text style={[styles.value, styles.collectedValue]}>
            ₹{item.totalCashCollected?.toLocaleString() || '0'}
          </Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.label}>Variance:</Text>
          <Text style={[styles.value, { color: getVarianceColor(item.variance || 0) }]}>
            {item.variance >= 0 ? '+' : ''}₹{item.variance?.toLocaleString() || '0'}
          </Text>
        </View>

        {item.verifiedBy && (
          <View style={styles.verifiedRow}>
            <Text style={styles.verifiedText}>
              ✓ Verified on {new Date(item.verifiedAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#000000']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📋</Text>
            <Text style={styles.emptyTitle}>No Collections Yet</Text>
            <Text style={styles.emptySubtitle}>Your submitted cash collections will appear here</Text>
          </View>
        }
        contentContainerStyle={collections.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

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
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  collectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter',
  },
  cardBody: {
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter',
  },
  collectedValue: {
    color: '#16A34A',
  },
  verifiedRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  verifiedText: {
    fontSize: 12,
    color: '#16A34A',
    fontStyle: 'italic',
  },
});
