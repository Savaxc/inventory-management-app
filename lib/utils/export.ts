/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from "papaparse";

export const exportToCSV = (data: any[], fileName: string) => {
  const csvData = data.map(item => ({
    "Product Name": item.name,
    "SKU": item.sku || 'N/A',
    "Category": item.categoryName || 'General',
    "Price": Number(item.price).toFixed(2),
    "Stock Quantity": item.quantity,
    "Total Value": (Number(item.price) * item.quantity).toFixed(2),
    "Status": item.quantity === 0 ? "Out of Stock" : item.quantity <= (item.lowStockAt || 5) ? "Low Stock" : "In Stock"
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};