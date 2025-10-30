import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getCollectionById } from '../services/cashCollectionService';

export default function CollectionDetailsScreen({ route }) {
  const { collectionId } = route.params;
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const response = await getCollectionById(collectionId);
      setCollection(response.data);
    } catch (error) {
      console.error('Error loading collection details:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dateText}>
              {new Date(collection.collectionDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.timeText}>
              Submitted at {new Date(collection.createdAt).toLocaleTimeString('en-IN')}
            </Text>
          </View>
          {getStatusBadge(collection.status)}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Summary</Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expected Cash:</Text>
            <Text style={styles.summaryValue}>
              ₹{collection.expectedCash?.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cash Collected:</Text>
            <Text style={[styles.summaryValue, { color: '#16A34A' }]}>
              ₹{collection.totalCashCollected?.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.varianceRow]}>
            <Text style={styles.varianceLabel}>Day Variance:</Text>
            <Text style={[styles.varianceValue, { color: getVarianceColor(collection.variance || 0) }]}>
              {collection.variance >= 0 ? '+' : ''}₹{collection.variance?.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.varianceRow]}>
            <Text style={styles.varianceLabel}>Running Total:</Text>
            <Text style={[styles.varianceValue, { color: getVarianceColor(collection.cumulativeVariance || 0) }]}>
              {(collection.cumulativeVariance || 0) >= 0 ? '+' : ''}₹{Math.abs(collection.cumulativeVariance || 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Cash Denominations */}
      {collection.denominations && collection.denominations.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💵 Cash Denominations</Text>
          {collection.denominations
            .filter(d => d.noteCount > 0)
            .sort((a, b) => b.noteValue - a.noteValue)
            .map((denom, index) => (
              <View key={index} style={styles.denominationRow}>
                <Text style={styles.denominationLabel}>₹{denom.noteValue}</Text>
                <Text style={styles.denominationCount}>× {denom.noteCount}</Text>
                <Text style={styles.denominationTotal}>
                  ₹{denom.totalValue.toLocaleString()}
                </Text>
              </View>
            ))}
          
          {/* Coins Section */}
          {collection.coins > 0 && (
            <View style={styles.coinsRow}>
              <Text style={styles.coinsLabel}>🪙 Coins (₹1 + ₹2 + ₹5):</Text>
              <Text style={styles.coinsValue}>
                ₹{collection.coins.toLocaleString()}
              </Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              ₹{collection.totalCashCollected?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>
      )}

      {/* Other Payment Methods */}
      {(collection.totalChequeReceived > 0 || 
        collection.totalOnlineReceived > 0 || 
        collection.totalCreditGiven > 0) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💳 Other Payments</Text>
          
          {collection.totalChequeReceived > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Cheque Received:</Text>
              <Text style={styles.paymentValue}>
                ₹{collection.totalChequeReceived.toLocaleString()}
              </Text>
            </View>
          )}

          {collection.totalOnlineReceived > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Online Payment:</Text>
              <Text style={styles.paymentValue}>
                ₹{collection.totalOnlineReceived.toLocaleString()}
              </Text>
            </View>
          )}

          {collection.totalCreditGiven > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Credit Given:</Text>
              <Text style={styles.paymentValue}>
                ₹{collection.totalCreditGiven.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={[styles.paymentRow, styles.totalPaymentRow]}>
            <Text style={styles.totalPaymentLabel}>Total Received:</Text>
            <Text style={styles.totalPaymentValue}>
              ₹{(
                (collection.totalCashCollected || 0) + 
                (collection.totalChequeReceived || 0) + 
                (collection.totalOnlineReceived || 0)
              ).toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Notes */}
      {collection.notes && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Notes</Text>
          <Text style={styles.notesText}>{collection.notes}</Text>
        </View>
      )}

      {/* Verification Info */}
      {collection.verifiedBy && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✓ Verification Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verified By:</Text>
            <Text style={styles.infoValue}>{collection.verifiedBy.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verified At:</Text>
            <Text style={styles.infoValue}>
              {new Date(collection.verifiedAt).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: {
    fontSize: 14,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    fontFamily: 'Inter',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  varianceRow: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  varianceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  varianceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  denominationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  denominationLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  denominationCount: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 16,
  },
  denominationTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
    minWidth: 100,
    textAlign: 'right',
  },
  coinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  coinsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  coinsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalPaymentRow: {
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalPaymentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalPaymentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
});
