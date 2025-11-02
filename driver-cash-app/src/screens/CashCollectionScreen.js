import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getStoredUser } from '../services/authService';
import { submitCashCollection } from '../services/cashCollectionService';

const DENOMINATIONS = [
  { value: 2000, label: '₹2000' },
  { value: 500, label: '₹500' },
  { value: 200, label: '₹200' },
  { value: 100, label: '₹100' },
  { value: 50, label: '₹50' },
  { value: 20, label: '₹20' },
  { value: 10, label: '₹10' },
];

export default function CashCollectionScreen({ route, navigation }) {
  const { dispatch } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cash denominations
  const [denominations, setDenominations] = useState(
    DENOMINATIONS.map(d => ({ noteValue: d.value, noteCount: 0, totalValue: 0 }))
  );

  // Payment details
  const [totalCashReceived, setTotalCashReceived] = useState(0);
  const [totalChequeReceived, setTotalChequeReceived] = useState(0);
  const [totalOnlineReceived, setTotalOnlineReceived] = useState(0);
  const [totalCreditGiven, setTotalCreditGiven] = useState(0);
  
  // NEW FIELDS
  const [creditReceivedCash, setCreditReceivedCash] = useState('');
  const [creditReceivedCheque, setCreditReceivedCheque] = useState('');
  const [bounceReceivedCash, setBounceReceivedCash] = useState('');
  const [bounceReceivedCheque, setBounceReceivedCheque] = useState('');
  const [emptyBottlesReceived, setEmptyBottlesReceived] = useState('');
  const [coins, setCoins] = useState(''); // Single field for all coins (₹1, ₹2, ₹5)
  
  // RGB (Returnable Glass Bottles) tracking
  const [returnedFullCrates, setReturnedFullCrates] = useState('');
  const [returnedEmptyCrates, setReturnedEmptyCrates] = useState('');
  
  // NEW FIELDS - Invoice, Outlet, Salesman, Expense
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [outletName, setOutletName] = useState('');
  const [salesmanName, setSalesmanName] = useState('');
  const [dailyExpenseAmount, setDailyExpenseAmount] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  
  const [expectedCash, setExpectedCash] = useState('');
  const [notes, setNotes] = useState('');

  // Calculated values
  const [totalCashFromDenominations, setTotalCashFromDenominations] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [variance, setVariance] = useState(0);

  useEffect(() => {
    loadUser();
    // Set expected cash from dispatch stock value (value of products dispatched)
    if (dispatch?.totalStockValue) {
      setExpectedCash(dispatch.totalStockValue.toString());
    }
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [denominations, coins, totalChequeReceived, totalOnlineReceived, totalCreditGiven, expectedCash]);

  const loadUser = async () => {
    const userData = await getStoredUser();
    setUser(userData);
  };

  const calculateTotals = () => {
    // Calculate total cash from denominations + coins
    const cashTotal = denominations.reduce((sum, d) => sum + d.totalValue, 0) + parseFloat(coins || 0);
    setTotalCashFromDenominations(cashTotal);

    // Calculate total received (cash + cheque + online)
    const total = cashTotal + parseFloat(totalChequeReceived || 0) + parseFloat(totalOnlineReceived || 0);
    setTotalReceived(total);
    setTotalCashReceived(cashTotal);

    // Calculate variance
    const expected = parseFloat(expectedCash || 0);
    const creditGiven = parseFloat(totalCreditGiven || 0);
    const actualReceived = total;
    
    // Variance = (Cash + Cheque + Online + Credit) - Expected
    const totalWithCredit = actualReceived + creditGiven;
    setVariance(totalWithCredit - expected);
  };

  const updateDenominationCount = (index, count) => {
    const newDenominations = [...denominations];
    const countValue = parseInt(count) || 0;
    newDenominations[index].noteCount = countValue;
    newDenominations[index].totalValue = newDenominations[index].noteValue * countValue;
    setDenominations(newDenominations);
  };

  const handleSubmit = async () => {
    if (!expectedCash) {
      Alert.alert('Error', 'Please enter expected cash amount');
      return;
    }

    if (totalCashFromDenominations === 0 && totalChequeReceived === 0 && totalOnlineReceived === 0) {
      Alert.alert('Error', 'Please enter at least one payment method');
      return;
    }

    // Confirmation alert with summary
    const creditRecTotal = parseFloat(creditReceivedCash || 0) + parseFloat(creditReceivedCheque || 0);
    const bounceRecTotal = parseFloat(bounceReceivedCash || 0) + parseFloat(bounceReceivedCheque || 0);
    
    Alert.alert(
      'Confirm Submission',
      `Cash from Denominations: ₹${totalCashFromDenominations.toLocaleString()}\n` +
      `Cheque Received: ₹${totalChequeReceived.toLocaleString()}\n` +
      `Online Received: ₹${totalOnlineReceived.toLocaleString()}\n` +
      `Credit Given: ₹${totalCreditGiven.toLocaleString()}\n\n` +
      `Credit Received: ₹${creditRecTotal.toLocaleString()}\n` +
      `Bounce Received: ₹${bounceRecTotal.toLocaleString()}\n` +
      `Empty Bottles: ${emptyBottlesReceived || 0} bottles\n\n` +
      `Total Received: ₹${totalReceived.toLocaleString()}\n` +
      `Expected: ₹${parseFloat(expectedCash).toLocaleString()}\n` +
      `Variance: ₹${variance.toLocaleString()}\n\n` +
      `Do you want to submit?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: submitCollection },
      ]
    );
  };

  const submitCollection = async () => {
    setLoading(true);
    try {
      console.log('🔍 User data:', user);
      console.log('🔍 Dispatch data:', dispatch);
      
      // Auto-calculate credit from remaining amount
      const totalReceived = totalCashFromDenominations + 
                           parseFloat(totalChequeReceived || 0) + 
                           parseFloat(totalOnlineReceived || 0);
      const remainingAmount = parseFloat(expectedCash) - totalReceived;
      const autoCredit = remainingAmount > 0 ? remainingAmount : 0;
      
      const collectionData = {
        driverId: user._id,
        dispatchId: dispatch._id,
        collectionDate: new Date().toISOString(),
        denominations: denominations.filter(d => d.noteCount > 0).map(d => ({
          noteValue: d.noteValue,
          noteCount: d.noteCount,
          totalValue: d.totalValue
        })),
        coins: parseFloat(coins || 0), // Single field for all coins
        totalCashCollected: totalCashFromDenominations,
        totalChequeReceived: parseFloat(totalChequeReceived || 0),
        totalOnlineReceived: parseFloat(totalOnlineReceived || 0),
        totalCreditGiven: parseFloat(totalCreditGiven || autoCredit),
        // NEW FIELDS - Credit/Bounce Received
        creditReceivedCash: parseFloat(creditReceivedCash || 0),
        creditReceivedCheque: parseFloat(creditReceivedCheque || 0),
        bounceReceivedCash: parseFloat(bounceReceivedCash || 0),
        bounceReceivedCheque: parseFloat(bounceReceivedCheque || 0),
        emptyBottlesReceived: parseInt(emptyBottlesReceived || 0),
        // NEW FIELDS - Invoice, Outlet, Salesman
        invoiceNumber: invoiceNumber.trim(),
        outletName: outletName.trim(),
        salesmanName: salesmanName.trim() || user?.name || '', // Auto-fill with driver name if empty
        // NEW FIELDS - Daily Expense
        dailyExpenseAmount: parseFloat(dailyExpenseAmount || 0),
        expenseNotes: expenseNotes.trim(),
        // RGB (Returnable Glass Bottles) fields
        returnedFullCrates: parseInt(returnedFullCrates || 0),
        returnedEmptyCrates: parseInt(returnedEmptyCrates || 0),
        expectedCash: parseFloat(expectedCash),
        notes: notes.trim(),
      };

      console.log('📤 Submitting collection:', JSON.stringify(collectionData, null, 2));

      await submitCashCollection(collectionData);

      Alert.alert(
        'Success',
        'Cash collection submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit cash collection. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getVarianceColor = () => {
    if (variance === 0) return '#16A34A'; // Green
    if (Math.abs(variance) < 100) return '#F59E0B'; // Yellow
    return '#DC2626'; // Red
  };

  return (
    <ScrollView style={styles.container}>
      {/* Dispatch Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dispatch Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>{new Date(dispatch.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stock Value (Expected):</Text>
          <Text style={[styles.infoValue, styles.highlightValue]}>₹{dispatch.totalStockValue?.toLocaleString() || '0'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cash Given:</Text>
          <Text style={styles.infoValue}>₹{dispatch.totalCashValue?.toLocaleString() || '0'}</Text>
        </View>
      </View>

      {/* Bill Details Section - NEW */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📄 Bill Details</Text>
        <Text style={styles.subtitle}>Enter invoice and outlet information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Invoice Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter invoice/bill number"
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            maxLength={50}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Outlet Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter outlet/shop name"
            value={outletName}
            onChangeText={setOutletName}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Salesman Name</Text>
          <TextInput
            style={styles.input}
            placeholder={user?.name || "Enter salesman name"}
            value={salesmanName}
            onChangeText={setSalesmanName}
            maxLength={100}
          />
          <Text style={styles.helperText}>Auto-filled with your name. You can change it if needed.</Text>
        </View>
      </View>

      {/* Daily Expense Section - NEW */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💸 Daily Expense</Text>
        <Text style={styles.subtitle}>Enter total expenses for the day (fuel, food, etc.)</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Total Expense Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="₹0"
            keyboardType="numeric"
            value={dailyExpenseAmount}
            onChangeText={setDailyExpenseAmount}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Expense Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add expense details (e.g., Fuel ₹500, Food ₹200)"
            multiline
            numberOfLines={3}
            value={expenseNotes}
            onChangeText={setExpenseNotes}
            maxLength={500}
          />
          <Text style={styles.charCount}>{expenseNotes.length}/500</Text>
        </View>

        {parseFloat(dailyExpenseAmount || 0) > 0 && (
          <View style={styles.expenseHighlight}>
            <Text style={styles.expenseHighlightText}>
              Total Daily Expense: ₹{parseFloat(dailyExpenseAmount || 0).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Cash Denominations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💵 Cash Denominations</Text>
        <Text style={styles.subtitle}>Enter count for each denomination</Text>
        
        {DENOMINATIONS.map((denom, index) => {
          const denominationData = denominations[index];
          return (
            <View key={denom.value} style={styles.denominationRow}>
              <View style={styles.denominationLabel}>
                <Text style={styles.denominationText}>{denom.label}</Text>
                <Text style={styles.denominationCount}>
                  {denominationData.noteCount > 0 ? `× ${denominationData.noteCount}` : ''}
                </Text>
              </View>
              <TextInput
                style={styles.denominationInput}
                placeholder="0"
                keyboardType="number-pad"
                value={denominationData.noteCount > 0 ? denominationData.noteCount.toString() : ''}
                onChangeText={(text) => updateDenominationCount(index, text)}
              />
              <Text style={styles.denominationTotal}>
                ₹{denominationData.totalValue.toLocaleString()}
              </Text>
            </View>
          );
        })}
        
        {/* Coins Input - Single field for ₹1, ₹2, ₹5 */}
        <View style={styles.coinsSection}>
          <Text style={styles.coinsLabel}>🪙 Coins (₹1 + ₹2 + ₹5)</Text>
          <TextInput
            style={styles.coinsInput}
            placeholder="Enter total coins amount"
            keyboardType="numeric"
            value={coins}
            onChangeText={setCoins}
          />
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Cash:</Text>
          <Text style={styles.totalValue}>₹{totalCashFromDenominations.toLocaleString()}</Text>
        </View>
      </View>

      {/* Other Payment Methods */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💳 Other Payment Methods</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cheque Received</Text>
          <TextInput
            style={styles.input}
            placeholder="₹0"
            keyboardType="numeric"
            value={totalChequeReceived > 0 ? totalChequeReceived.toString() : ''}
            onChangeText={setTotalChequeReceived}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Online Payment Received (UPI/Card)</Text>
          <TextInput
            style={styles.input}
            placeholder="₹0"
            keyboardType="numeric"
            value={totalOnlineReceived > 0 ? totalOnlineReceived.toString() : ''}
            onChangeText={setTotalOnlineReceived}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Credit Given to Retailers</Text>
          <TextInput
            style={styles.input}
            placeholder="₹0"
            keyboardType="numeric"
            value={totalCreditGiven > 0 ? totalCreditGiven.toString() : ''}
            onChangeText={setTotalCreditGiven}
          />
        </View>
      </View>

      {/* Credit Received Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Credit Received (Previous Credit Collection)</Text>
        <Text style={styles.subtitle}>Amount received from previous credit sales</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Credit Received by Cash</Text>
          <TextInput
            style={styles.input}
            placeholder="₹0"
            keyboardType="numeric"
            value={creditReceivedCash}
            onChangeText={setCreditReceivedCash}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Credit Received by Cheque</Text>
          <TextInput
            style={styles.input}
            placeholder="₹0"
            keyboardType="numeric"
            value={creditReceivedCheque}
            onChangeText={setCreditReceivedCheque}
          />
        </View>

        {(parseFloat(creditReceivedCash || 0) + parseFloat(creditReceivedCheque || 0)) > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Credit Received:</Text>
            <Text style={styles.totalValue}>
              ₹{(parseFloat(creditReceivedCash || 0) + parseFloat(creditReceivedCheque || 0)).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Bounce Received Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 Bounce Received (Returned Cheque Amount)</Text>
        <Text style={styles.subtitle}>Amount received for previously bounced cheques</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bounce Received by Cash</Text>
          <TextInput
            style={styles.input}
            placeholder="₹0"
            keyboardType="numeric"
            value={bounceReceivedCash}
            onChangeText={setBounceReceivedCash}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bounce Received by Cheque</Text>
          <TextInput
            style={styles.input}
            placeholder="₹0"
            keyboardType="numeric"
            value={bounceReceivedCheque}
            onChangeText={setBounceReceivedCheque}
          />
        </View>

        {(parseFloat(bounceReceivedCash || 0) + parseFloat(bounceReceivedCheque || 0)) > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Bounce Received:</Text>
            <Text style={styles.totalValue}>
              ₹{(parseFloat(bounceReceivedCash || 0) + parseFloat(bounceReceivedCheque || 0)).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Empty Bottles Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍾 Empty Bottles Received</Text>
        <Text style={styles.subtitle}>Number of empty bottles collected from retailers</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Empty Bottles Count</Text>
          <TextInput
            style={styles.input}
            placeholder="0 bottles"
            keyboardType="numeric"
            value={emptyBottlesReceived}
            onChangeText={setEmptyBottlesReceived}
          />
        </View>

        {parseFloat(emptyBottlesReceived || 0) > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Bottles:</Text>
            <Text style={[styles.infoValue, { color: '#16A34A', fontSize: 18, fontWeight: 'bold' }]}>
              {parseFloat(emptyBottlesReceived || 0)} bottles
            </Text>
          </View>
        )}
      </View>

      {/* RGB (Returnable Glass Bottles) Tracking Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 RGB Returns (Returnable Glass Bottles)</Text>
        <Text style={styles.subtitle}>Track full and empty crate returns</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Crates Returned (Unsold)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2"
            keyboardType="numeric"
            value={returnedFullCrates}
            onChangeText={setReturnedFullCrates}
          />
          <Text style={styles.helpText}>Crates with full bottles that were not sold</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Empty Crates Returned</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 45"
            keyboardType="numeric"
            value={returnedEmptyCrates}
            onChangeText={setReturnedEmptyCrates}
          />
          <Text style={styles.helpText}>Empty crates returned after sales</Text>
        </View>

        {/* RGB Calculation Display */}
        {dispatch?.totalStockValue && (returnedFullCrates || returnedEmptyCrates) && (
          <View style={styles.rgbCalculation}>
            <Text style={styles.rgbTitle}>📊 RGB Calculation</Text>
            
            <View style={styles.rgbRow}>
              <Text style={styles.rgbLabel}>Total Loaded:</Text>
              <Text style={styles.rgbValue}>52 crates</Text>
            </View>
            
            {returnedFullCrates && (
              <>
                <View style={styles.rgbRow}>
                  <Text style={styles.rgbLabel}>Returned Full:</Text>
                  <Text style={styles.rgbValue}>{returnedFullCrates} crates</Text>
                </View>
                <View style={styles.rgbRow}>
                  <Text style={styles.rgbLabel}>Actual Sold:</Text>
                  <Text style={[styles.rgbValue, { color: '#16A34A', fontWeight: 'bold' }]}>
                    {52 - parseInt(returnedFullCrates || 0)} crates
                  </Text>
                </View>
              </>
            )}
            
            {returnedEmptyCrates && (
              <>
                <View style={[styles.rgbRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }]}>
                  <Text style={styles.rgbLabel}>Expected Empties:</Text>
                  <Text style={styles.rgbValue}>{52 - parseInt(returnedFullCrates || 0)} crates</Text>
                </View>
                <View style={styles.rgbRow}>
                  <Text style={styles.rgbLabel}>Returned Empties:</Text>
                  <Text style={styles.rgbValue}>{returnedEmptyCrates} crates</Text>
                </View>
                <View style={styles.rgbRow}>
                  <Text style={styles.rgbLabel}>Missing Empties:</Text>
                  <Text style={[styles.rgbValue, { 
                    color: (52 - parseInt(returnedFullCrates || 0) - parseInt(returnedEmptyCrates || 0)) > 0 ? '#DC2626' : '#16A34A',
                    fontWeight: 'bold'
                  }]}>
                    {Math.max(0, 52 - parseInt(returnedFullCrates || 0) - parseInt(returnedEmptyCrates || 0))} crates
                  </Text>
                </View>
                {(52 - parseInt(returnedFullCrates || 0) - parseInt(returnedEmptyCrates || 0)) > 0 && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      ⚠️ Missing empties penalty: ₹{(52 - parseInt(returnedFullCrates || 0) - parseInt(returnedEmptyCrates || 0)) * 50}
                      {'\n'}(₹50 per missing crate)
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>

      {/* Expected Cash */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Summary</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Expected Cash Amount (From Dispatch)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Auto-filled from dispatch"
            keyboardType="numeric"
            value={expectedCash}
            editable={false}
          />
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cash (Denominations):</Text>
            <Text style={styles.summaryValue}>₹{totalCashFromDenominations.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cheque:</Text>
            <Text style={styles.summaryValue}>₹{parseFloat(totalChequeReceived || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Online:</Text>
            <Text style={styles.summaryValue}>₹{parseFloat(totalOnlineReceived || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Credit Given:</Text>
            <Text style={styles.summaryValue}>₹{parseFloat(totalCreditGiven || 0).toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryDivider]}>
            <Text style={styles.summaryTotalLabel}>Total Collected:</Text>
            <Text style={styles.summaryTotalValue}>₹{totalReceived.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expected:</Text>
            <Text style={styles.summaryValue}>₹{parseFloat(expectedCash || 0).toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.varianceRow]}>
            <Text style={styles.varianceLabel}>Variance:</Text>
            <Text style={[styles.varianceValue, { color: getVarianceColor() }]}>
              {variance >= 0 ? '+' : ''}₹{variance.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Notes (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Add any notes or comments about the collection..."
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          maxLength={500}
        />
        <Text style={styles.charCount}>{notes.length}/500</Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Cash Collection</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
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
  highlightValue: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: 'bold',
  },
  denominationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  denominationLabel: {
    flex: 1,
  },
  denominationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  denominationCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  denominationInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  denominationTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
    minWidth: 80,
    textAlign: 'right',
  },
  coinsSection: {
    marginTop: 16,
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
    marginBottom: 8,
  },
  coinsInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  disabledInput: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
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
  summaryDivider: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  varianceRow: {
    backgroundColor: '#FEF2F2',
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
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#000000',
    margin: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  expenseHighlight: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginTop: 12,
  },
  expenseHighlightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  // RGB Tracking Styles
  rgbCalculation: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  rgbTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  rgbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rgbLabel: {
    fontSize: 14,
    color: '#374151',
  },
  rgbValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  warningText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
