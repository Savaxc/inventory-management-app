/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  summarySection: { marginVertical: 15, padding: 10, backgroundColor: '#f3f4f6', borderRadius: 5 },
  
  tableContainer: { 
    flexDirection: 'column',
    marginTop: 10 
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderColor: '#e5e7eb', 
    minHeight: 25, 
    alignItems: 'center',
    fontStyle: 'normal'
  },
  tableHeader: { 
    backgroundColor: '#4f46e5', 
    color: 'white', 
    fontWeight: 'bold' 
  },
  col1: { width: '40%', paddingLeft: 5 },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'center' },
  col4: { width: '20%', textAlign: 'right', paddingRight: 5 },
});

export const InventoryPDFReport = ({ products }: { products: any[] }) => {
  const totalValue = products.reduce((acc, curr) => acc + (Number(curr.price) * curr.quantity), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Inventory Valuation Report</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.summarySection}>
          <Text>Total Stock Items: {products.length}</Text>
          <Text>Total Inventory Value: ${totalValue.toFixed(2)}</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.col1}>Product</Text>
            <Text style={styles.col2}>Price</Text>
            <Text style={styles.col3}>Stock</Text>
            <Text style={styles.col4}>Total</Text>
          </View>
          
          {products.map((p, i) => (
            <View key={i} style={styles.tableRow} wrap={false}> 
              <Text style={styles.col1}>{p.name}</Text>
              <Text style={styles.col2}>${Number(p.price).toFixed(2)}</Text>
              <Text style={styles.col3}>{p.quantity}</Text>
              <Text style={styles.col4}>${(Number(p.price) * p.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};