'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp, Warehouse, Download, Upload, FileText, Copy, Trash2, X, FileSpreadsheet, HelpCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const FabricApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fabrics, setFabrics] = useState([]);
  const [products, setProducts] = useState([]);
  const [productionRecords, setProductionRecords] = useState([]);
  
  // Modal states
  const [showFabricModal, setShowFabricModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState('');
  const [importText, setImportText] = useState('');
  
  // Form states
  const [fabricForm, setFabricForm] = useState({
    code: '', material: '', color: '', width: '', currentLength: '', price: ''
  });
  
  const [productForm, setProductForm] = useState({
    code: '', name: '', fabricCode: '', fabricUsage: '', type: ''
  });
  
  const [productionForm, setProductionForm] = useState({
    date: '', productCode: '', quantity: '', notes: ''
  });

  // Editing states
  const [editingFabric, setEditingFabric] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProduction, setEditingProduction] = useState(null);

  // Notification states
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);

  // Initialize with sample data and welcome notification
  useEffect(() => {
    // Check if welcome notification has been shown before
    const hasSeenWelcome = localStorage.getItem('fabric-app-welcome-seen');
    
    // Chỉ load sample data nếu chưa có dữ liệu
    if (fabrics.length === 0 && products.length === 0 && productionRecords.length === 0) {
      const sampleFabrics = [
        {
          id: 1,
          code: 'VAI001',
          material: 'Cotton',
          color: 'Trắng',
          width: '1.6m',
          currentLength: 200,
          price: 55000
        },
        {
          id: 2,
          code: 'VAI002', 
          material: 'Polyester',
          color: 'Xanh dương',
          width: '2.0m',
          currentLength: 120,
          price: 48000
        },
        {
          id: 3,
          code: 'VAI003',
          material: 'Satin',
          color: 'Hồng',
          width: '1.5m',
          currentLength: 80,
          price: 75000
        }
      ];

      const sampleProducts = [
        {
          id: 1,
          code: 'SP001',
          name: 'Bộ chăn ga đôi',
          type: 'Bộ chăn ga',
          fabricCode: 'VAI001',
          fabricUsage: 5.5
        },
        {
          id: 2,
          code: 'SP002',
          name: 'Gối ôm lông vũ',
          type: 'Gối',
          fabricCode: 'VAI002',
          fabricUsage: 1.2
        }
      ];

      setFabrics(sampleFabrics);
      setProducts(sampleProducts);
      
      // Show welcome notification only if not seen before
      if (!hasSeenWelcome) {
        setTimeout(() => {
          setShowWelcomeNotification(true);
        }, 1000);
      }
    }
  }, []);

  // Helper function để nhắc nhở backup
  const remindBackup = () => {
    const totalRecords = fabrics.length + products.length + productionRecords.length;
    if (totalRecords > 0 && totalRecords % 5 === 0) {
      setTimeout(() => {
        if (window.confirm('💾 NHẮC NHỞ BACKUP DỮ LIỆU\n\n' +
                          `📊 Bạn đã có ${totalRecords} bản ghi trong hệ thống!\n\n` +
                          '⚠️ Dữ liệu sẽ mất khi refresh trang.\n' +
                          '🔄 Bạn có muốn backup dữ liệu ngay bây giờ không?')) {
          exportAllData();
        }
      }, 500);
    }
  };

  // Calculate summary
  const totalItems = fabrics.length;
  const totalValue = fabrics.reduce((sum, f) => sum + (f.currentLength * f.price), 0);
  const lowStock = fabrics.filter(f => f.currentLength < 150).length;
  const totalUsed = productionRecords.reduce((sum, r) => sum + r.fabricUsed, 0);

  // Form handlers
  const handleAddFabric = () => {
    if (!fabricForm.code || !fabricForm.material) return;
    
    if (editingFabric) {
      setFabrics(fabrics.map(f => 
        f.id === editingFabric.id 
          ? { ...editingFabric, ...fabricForm, currentLength: parseFloat(fabricForm.currentLength) || 0, price: parseFloat(fabricForm.price) || 0 }
          : f
      ));
      setEditingFabric(null);
    } else {
      const newFabric = {
        id: Date.now(),
        ...fabricForm,
        currentLength: parseFloat(fabricForm.currentLength) || 0,
        price: parseFloat(fabricForm.price) || 0
      };
      setFabrics([...fabrics, newFabric]);
    }
    
    setFabricForm({ code: '', material: '', color: '', width: '', currentLength: '', price: '' });
    setShowFabricModal(false);
    remindBackup(); // Nhắc nhở backup
  };

  const handleEditFabric = (fabric) => {
    setEditingFabric(fabric);
    setFabricForm({
      code: fabric.code,
      material: fabric.material,
      color: fabric.color || '',
      width: fabric.width || '',
      currentLength: fabric.currentLength.toString(),
      price: fabric.price.toString()
    });
    setShowFabricModal(true);
  };

  const handleDeleteFabric = (fabricId) => {
    if (window.confirm('Bạn có chắc muốn xóa vải này?')) {
      setFabrics(prevFabrics => prevFabrics.filter(f => f.id !== fabricId));
    }
  };

  const handleDuplicateFabric = (fabric) => {
    const duplicatedFabric = {
      ...fabric,
      id: Date.now(),
      code: fabric.code + '_COPY',
    };
    setFabrics(prev => [...prev, duplicatedFabric]);
    alert(`✅ Đã sao chép vải ${fabric.code} thành ${duplicatedFabric.code}`);
  };

  const handleAddProduct = () => {
    if (!productForm.code || !productForm.name) return;
    
    if (editingProduct) {
      setProducts(prevProducts => prevProducts.map(p => 
        p.id === editingProduct.id 
          ? { ...editingProduct, ...productForm, fabricUsage: parseFloat(productForm.fabricUsage) || 0 }
          : p
      ));
      setEditingProduct(null);
    } else {
      const newProduct = {
        id: Date.now(),
        ...productForm,
        fabricUsage: parseFloat(productForm.fabricUsage) || 0
      };
      setProducts(prevProducts => [...prevProducts, newProduct]);
    }
    
    setProductForm({ code: '', name: '', fabricCode: '', fabricUsage: '', type: '' });
    setShowProductModal(false);
    remindBackup(); // Nhắc nhở backup
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      code: product.code,
      name: product.name,
      fabricCode: product.fabricCode || '',
      fabricUsage: product.fabricUsage.toString(),
      type: product.type || ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    }
  };

  const handleDuplicateProduct = (product) => {
    const duplicatedProduct = {
      ...product,
      id: Date.now(),
      code: product.code + '_COPY',
      name: product.name + ' (Sao chép)'
    };
    setProducts(prev => [...prev, duplicatedProduct]);
    alert(`✅ Đã sao chép sản phẩm ${product.code} thành ${duplicatedProduct.code}`);
  };

  // Delete all products with confirmation
  const handleDeleteAllProducts = () => {
    if (products.length === 0) {
      alert('❌ Không có sản phẩm nào để xóa!');
      return;
    }

    const confirmMessage = `⚠️ CẢNH BÁO: XÓA TẤT CẢ SẢN PHẨM\n\n` +
                          `🗑️ Bạn có chắc chắn muốn xóa tất cả ${products.length} sản phẩm?\n\n` +
                          `❗ Hành động này KHÔNG THỂ HOÀN TÁC!\n\n` +
                          `💾 Hãy đảm bảo bạn đã backup dữ liệu trước khi thực hiện.`;

    if (window.confirm(confirmMessage)) {
      setProducts([]);
      alert(`✅ Đã xóa thành công tất cả sản phẩm!`);
    }
  };

  // Close welcome notification and mark as seen
  const closeWelcomeNotification = () => {
    setShowWelcomeNotification(false);
    localStorage.setItem('fabric-app-welcome-seen', 'true');
  };

  const handleAddProduction = () => {
    if (!productionForm.productCode || !productionForm.quantity) return;
    
    const quantity = parseInt(productionForm.quantity) || 0;
    const product = products.find(p => p.code === productionForm.productCode);
    
    if (!product) return;
    
    const totalFabricNeeded = product.fabricUsage * quantity;
    const fabric = fabrics.find(f => f.code === product.fabricCode);
    
    if (!editingProduction) {
      if (!fabric || fabric.currentLength < totalFabricNeeded) {
        const shortageAmount = totalFabricNeeded - (fabric ? fabric.currentLength : 0);
        alert(`❌ KHÔNG ĐỦ VẢI!\n\n🔹 Cần: ${totalFabricNeeded}m\n🔹 Còn lại: ${fabric ? fabric.currentLength : 0}m\n🔹 Thiếu: ${shortageAmount.toFixed(1)}m\n\n⚠️ VUI LÒNG NHẬP THÊM VẢI TRƯỚC KHI SẢN XUẤT!`);
        return;
      }
    }
    
    const fabricValue = totalFabricNeeded * (fabric ? fabric.price : 0);
    
    if (editingProduction) {
      const oldRecord = productionRecords.find(r => r.id === editingProduction.id);
      const oldProduct = products.find(p => p.code === oldRecord.productCode);
      const oldFabricNeeded = oldProduct ? oldProduct.fabricUsage * oldRecord.quantity : 0;
      
      setFabrics(fabrics.map(f => {
        if (f.code === (oldProduct ? oldProduct.fabricCode : '')) {
          const restoredAmount = f.currentLength + oldFabricNeeded;
          return { ...f, currentLength: Math.round((restoredAmount - totalFabricNeeded) * 10) / 10 };
        }
        return f;
      }));
      
      const updatedRecord = {
        ...editingProduction,
        ...productionForm,
        quantity,
        fabricUsed: Math.round(totalFabricNeeded * 10) / 10,
        fabricValue: fabricValue,
        productName: product.name,
        fabricCode: product.fabricCode
      };
      
      setProductionRecords(productionRecords.map(r => 
        r.id === editingProduction.id ? updatedRecord : r
      ));
      setEditingProduction(null);
    } else {
      const newRecord = {
        id: Date.now(),
        ...productionForm,
        quantity,
        fabricUsed: Math.round(totalFabricNeeded * 10) / 10,
        fabricValue: fabricValue,
        productName: product.name,
        fabricCode: product.fabricCode
      };
      
      setFabrics(fabrics.map(f => 
        f.code === product.fabricCode 
          ? { ...f, currentLength: Math.round((f.currentLength - totalFabricNeeded) * 10) / 10 }
          : f
      ));
      
      setProductionRecords([...productionRecords, newRecord]);
    }
    
    setProductionForm({ date: '', productCode: '', quantity: '', notes: '' });
    setShowProductionModal(false);
    remindBackup(); // Nhắc nhở backup
  };

  const handleEditProduction = (record) => {
    setEditingProduction(record);
    setProductionForm({
      date: record.date,
      productCode: record.productCode,
      quantity: record.quantity.toString(),
      notes: record.notes || ''
    });
    setShowProductionModal(true);
  };

  const handleDeleteProduction = (recordId) => {
    if (window.confirm('Bạn có chắc muốn xóa lệnh sản xuất này? Vải sẽ được hoàn trả về kho.')) {
      const record = productionRecords.find(r => r.id === recordId);
      if (record) {
        const product = products.find(p => p.code === record.productCode);
        if (product) {
          setFabrics(prevFabrics => prevFabrics.map(f => 
            f.code === product.fabricCode 
              ? { ...f, currentLength: Math.round((f.currentLength + record.fabricUsed) * 10) / 10 }
              : f
          ));
        }
      }
      setProductionRecords(prevRecords => prevRecords.filter(r => r.id !== recordId));
    }
  };

  // Export functions
  const exportToText = (data, filename) => {
    if (!data || data.length === 0) {
      alert('❌ Không có dữ liệu để xuất!');
      return;
    }
    
    try {
      const headers = Object.keys(data[0]);
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvRows.push(values.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      setImportText(csvContent);
      setImportType('export');
      setShowImportModal(true);
    } catch (error) {
      alert('❌ Lỗi xuất file: ' + error.message);
    }
  };

  const exportFabrics = () => {
    try {
      let fabricData;
      if (fabrics.length === 0) {
        fabricData = [{
          'Mã vải': 'VAI001',
          'Chất liệu': 'Cotton',
          'Màu sắc': 'Trắng',
          'Khổ vải': '1.6m',
          'Tồn kho (m)': 100,
          'Đơn giá (đ)': 50000,
          'Giá trị (đ)': 5000000
        }];
        alert('📋 Danh sách trống! Sẽ xuất file mẫu để bạn tham khảo format nhập liệu.');
      } else {
        fabricData = fabrics.map(f => ({
          'Mã vải': f.code,
          'Chất liệu': f.material,
          'Màu sắc': f.color || '',
          'Khổ vải': f.width || '',
          'Tồn kho (m)': f.currentLength,
          'Đơn giá (đ)': f.price,
          'Giá trị (đ)': f.currentLength * f.price
        }));
      }
      exportToText(fabricData, 'danh_muc_vai');
    } catch (error) {
      alert('❌ Lỗi xuất danh mục vải: ' + error.message);
    }
  };

  const exportProducts = () => {
    try {
      let productData;
      if (products.length === 0) {
        productData = [{
          'Mã sản phẩm': 'SP001',
          'Tên sản phẩm': 'Bộ chăn ga đôi',
          'Loại': 'Bộ chăn ga',
          'Mã vải': 'VAI001',
          'Định mức (m/bộ)': 5.5
        }];
        alert('Danh sách trống! Sẽ xuất file mẫu để bạn tham khảo format.');
      } else {
        productData = products.map(p => ({
          'Mã sản phẩm': p.code,
          'Tên sản phẩm': p.name,
          'Loại': p.type || '',
          'Mã vải': p.fabricCode || '',
          'Định mức (m/bộ)': p.fabricUsage
        }));
      }
      exportToText(productData, 'danh_muc_san_pham');
    } catch (error) {
      alert('Lỗi xuất danh mục sản phẩm: ' + error.message);
    }
  };

  const exportProduction = () => {
    try {
      let productionData;
      if (productionRecords.length === 0) {
        productionData = [{
          'Ngày': '2024-08-05',
          'Mã sản phẩm': 'SP001',
          'Tên sản phẩm': 'Bộ chăn ga đôi',
          'Số lượng': 10,
          'Vải đã dùng (m)': 55.0,
          'Giá trị vải (đ)': 2750000,
          'Ghi chú': 'Đơn hàng mẫu'
        }];
        alert('Danh sách trống! Sẽ xuất file mẫu để bạn tham khảo format.');
      } else {
        productionData = productionRecords.map(r => ({
          'Ngày': r.date,
          'Mã sản phẩm': r.productCode,
          'Tên sản phẩm': r.productName,
          'Số lượng': r.quantity,
          'Vải đã dùng (m)': Math.round(r.fabricUsed * 10) / 10,
          'Giá trị vải (đ)': r.fabricValue || 0,
          'Ghi chú': r.notes || ''
        }));
      }
      exportToText(productionData, 'theo_doi_san_xuat');
    } catch (error) {
      alert('Lỗi xuất theo dõi sản xuất: ' + error.message);
    }
  };

  const exportReport = () => {
    try {
      // Thống kê chi tiết về vải sử dụng
      const fabricUsageStats = {};
      productionRecords.forEach(record => {
        const fabricCode = record.fabricCode;
        if (!fabricUsageStats[fabricCode]) {
          const fabric = fabrics.find(f => f.code === fabricCode);
          fabricUsageStats[fabricCode] = {
            fabricName: fabric ? `${fabric.code} - ${fabric.material}` : fabricCode,
            totalUsed: 0,
            totalValue: 0,
            productionCount: 0
          };
        }
        fabricUsageStats[fabricCode].totalUsed += record.fabricUsed;
        fabricUsageStats[fabricCode].totalValue += record.fabricValue || 0;
        fabricUsageStats[fabricCode].productionCount += 1;
      });

      // Tạo HTML báo cáo
      const reportDate = new Date().toLocaleDateString('vi-VN');
      const reportTime = new Date().toLocaleTimeString('vi-VN');
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo Cáo Quản Lý Vải May - ${reportDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .report-header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .report-title {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .report-subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .report-content {
            padding: 40px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border-left: 5px solid;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card.blue { border-left-color: #3498db; }
        .stat-card.green { border-left-color: #2ecc71; }
        .stat-card.red { border-left-color: #e74c3c; }
        .stat-card.purple { border-left-color: #9b59b6; }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 1.1em;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .table th, .table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .table th {
            background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9em;
            letter-spacing: 1px;
        }
        
        .table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .table tr:hover {
            background-color: #e8f4fd;
            transform: scale(1.01);
            transition: all 0.3s ease;
        }
        
        .highlight {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: bold;
        }
        
        .success {
            color: #27ae60;
            font-weight: bold;
        }
        
        .warning {
            color: #f39c12;
            font-weight: bold;
        }
        
        .danger {
            color: #e74c3c;
            font-weight: bold;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            border-top: 1px solid #eee;
            background-color: #f8f9fa;
        }
        
        @media print {
            body { background: white; }
            .report-container { box-shadow: none; }
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <h1 class="report-title">📊 BÁO CÁO QUẢN LÝ VẢI MAY</h1>
            <p class="report-subtitle">Ngày xuất: ${reportDate} lúc ${reportTime}</p>
        </div>
        
        <div class="report-content">
            <div class="stats-grid">
                <div class="stat-card blue">
                    <div class="stat-number">${totalItems}</div>
                    <div class="stat-label">Tổng loại vải</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-number">${totalValue.toLocaleString()}</div>
                    <div class="stat-label">Giá trị tồn kho (đ)</div>
                </div>
                <div class="stat-card red">
                    <div class="stat-number">${lowStock}</div>
                    <div class="stat-label">Vải sắp hết (&lt;150m)</div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-number">${Math.round(totalUsed * 10) / 10}</div>
                    <div class="stat-label">Tổng vải đã dùng (m)</div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">🧵 Chi Tiết Tồn Kho Vải</h2>
                ${fabrics.length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Mã Vải</th>
                            <th>Chất Liệu</th>
                            <th>Màu Sắc</th>
                            <th>Tồn Kho (m)</th>
                            <th>Đơn Giá (đ)</th>
                            <th>Giá Trị (đ)</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fabrics.map(fabric => `
                        <tr>
                            <td><strong>${fabric.code}</strong></td>
                            <td>${fabric.material}</td>
                            <td>${fabric.color || 'N/A'}</td>
                            <td>${fabric.currentLength}m</td>
                            <td>${fabric.price.toLocaleString()}đ</td>
                            <td>${(fabric.currentLength * fabric.price).toLocaleString()}đ</td>
                            <td>
                                ${fabric.currentLength < 150 ? 
                                  '<span class="highlight">⚠️ Cần nhập hàng</span>' : 
                                  '<span class="success">✅ Đủ hàng</span>'
                                }
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<div class="no-data">Chưa có dữ liệu vải</div>'}
            </div>
            
            <div class="section">
                <h2 class="section-title">📦 Thống Kê Vải Đã Sử Dụng</h2>
                ${Object.keys(fabricUsageStats).length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Loại Vải</th>
                            <th>Tổng Sử Dụng (m)</th>
                            <th>Giá Trị (đ)</th>
                            <th>Số Lần Sản Xuất</th>
                            <th>Trung Bình/Lần (m)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.values(fabricUsageStats).map(stat => `
                        <tr>
                            <td><strong>${stat.fabricName}</strong></td>
                            <td>${Math.round(stat.totalUsed * 10) / 10}m</td>
                            <td>${stat.totalValue.toLocaleString()}đ</td>
                            <td>${stat.productionCount} lần</td>
                            <td>${Math.round((stat.totalUsed / stat.productionCount) * 10) / 10}m</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<div class="no-data">Chưa có dữ liệu sử dụng vải</div>'}
            </div>
            
            <div class="section">
                <h2 class="section-title">🏭 Lịch Sử Sản Xuất</h2>
                ${productionRecords.length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Ngày</th>
                            <th>Sản Phẩm</th>
                            <th>Số Lượng</th>
                            <th>Vải Sử Dụng (m)</th>
                            <th>Giá Trị (đ)</th>
                            <th>Ghi Chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productionRecords.map(record => `
                        <tr>
                            <td>${record.date}</td>
                            <td><strong>${record.productName}</strong></td>
                            <td>${record.quantity} bộ</td>
                            <td>${Math.round(record.fabricUsed * 10) / 10}m</td>
                            <td>${(record.fabricValue || 0).toLocaleString()}đ</td>
                            <td>${record.notes || 'N/A'}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<div class="no-data">Chưa có lịch sử sản xuất</div>'}
            </div>
            
            <div class="section">
                <h2 class="section-title">📊 Tổng Kết</h2>
                <table class="table">
                    <tbody>
                        <tr>
                            <td><strong>Tổng số loại vải</strong></td>
                            <td>${totalItems} loại</td>
                        </tr>
                        <tr>
                            <td><strong>Tổng số sản phẩm</strong></td>
                            <td>${products.length} sản phẩm</td>
                        </tr>
                        <tr>
                            <td><strong>Tổng lệnh sản xuất</strong></td>
                            <td>${productionRecords.length} lệnh</td>
                        </tr>
                        <tr>
                            <td><strong>Tổng giá trị tồn kho</strong></td>
                            <td><span class="success">${totalValue.toLocaleString()}đ</span></td>
                        </tr>
                        <tr>
                            <td><strong>Tổng vải đã sử dụng</strong></td>
                            <td><span class="warning">${Math.round(totalUsed * 10) / 10}m</span></td>
                        </tr>
                        <tr>
                            <td><strong>Vải cần nhập thêm</strong></td>
                            <td>${lowStock > 0 ? `<span class="danger">${lowStock} loại cần nhập hàng</span>` : `<span class="success">Tất cả vải đều đủ</span>`}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>📱 Hệ thống Quản Lý Vải May - Được tạo tự động bởi Claude AI</p>
            <p>Báo cáo này được xuất vào ${reportDate} lúc ${reportTime}</p>
        </div>
    </div>
</body>
</html>`;

      // Tạo và download file HTML
      const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao_cao_vai_may_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('✅ Đã xuất báo cáo HTML thành công!\n\n📁 File đã được tải về máy tính của bạn.\n🌐 Mở file bằng trình duyệt để xem báo cáo đẹp mắt.');
      
    } catch (error) {
      alert('❌ Lỗi xuất báo cáo: ' + error.message);
    }
  };

  const exportAllData = () => {
    const allData = {
      fabrics: fabrics,
      products: products,
      productionRecords: productionRecords,
      exportDate: new Date().toISOString(),
      summary: {
        totalItems,
        totalValue,
        lowStock,
        totalUsed: Math.round(totalUsed * 10) / 10
      }
    };
    
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_du_lieu_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✅ Đã backup toàn bộ dữ liệu thành công!\n\n💾 File backup đã được tải về máy tính.\n📁 Sử dụng tính năng "Khôi phục dữ liệu" để khôi phục khi cần.');
  };

  // Backup/Restore functions
  const handleImportBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        
        if (backupData.fabrics && backupData.products && backupData.productionRecords) {
          if (window.confirm('🔄 Khôi phục dữ liệu sẽ ghi đè toàn bộ dữ liệu hiện tại!\n\n📊 Dữ liệu trong file backup:\n' +
                             `- Vải: ${backupData.fabrics.length} loại\n` +
                             `- Sản phẩm: ${backupData.products.length} loại\n` +
                             `- Lệnh sản xuất: ${backupData.productionRecords.length} lệnh\n` +
                             `- Ngày backup: ${new Date(backupData.exportDate).toLocaleDateString('vi-VN')}\n\n` +
                             '✅ Bạn có muốn tiếp tục không?')) {
            
            setFabrics(backupData.fabrics);
            setProducts(backupData.products);
            setProductionRecords(backupData.productionRecords);
            
            alert('✅ Khôi phục dữ liệu thành công!\n\n🎉 Tất cả dữ liệu đã được khôi phục từ file backup.');
          }
        } else {
          alert('❌ File backup không hợp lệ!\n\n💡 Vui lòng chọn file backup đúng định dạng được xuất từ hệ thống này.');
        }
      } catch (error) {
        alert('❌ Lỗi đọc file backup: ' + error.message + '\n\n💡 Vui lòng kiểm tra lại file backup.');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Import functions
  const handleTextImport = () => {
    try {
      if (!importText.trim()) {
        alert('❌ Vui lòng paste dữ liệu CSV vào ô text!');
        return;
      }

      const lines = importText.trim().split('\n');
      if (lines.length < 2) {
        alert('❌ Dữ liệu không hợp lệ!\n\nCần ít nhất:\n- 1 dòng tiêu đề (header)\n- 1 dòng dữ liệu');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).filter(line => line.trim()).map((line) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });

      if (importType === 'fabrics') {
        const requiredHeaders = ['Mã vải', 'Chất liệu'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          alert(`❌ Thiếu cột bắt buộc: ${missingHeaders.join(', ')}\n\n💡 Format đúng:\nMã vải,Chất liệu,Màu sắc,Khổ vải,Tồn kho (m),Đơn giá (đ)`);
          return;
        }
        
        const importedFabrics = data.map((row, index) => {
          const fabric = {
            id: Date.now() + index,
            code: row['Mã vải'] || '',
            material: row['Chất liệu'] || '',
            color: row['Màu sắc'] || '',
            width: row['Khổ vải'] || '',
            currentLength: parseFloat(row['Tồn kho (m)'] || row['Tồn kho'] || 0),
            price: parseFloat(row['Đơn giá (đ)'] || row['Đơn giá'] || 0)
          };
          
          if (!fabric.code || !fabric.material) {
            throw new Error(`Dòng ${index + 2}: Thiếu mã vải hoặc chất liệu`);
          }
          return fabric;
        });
        
        if (window.confirm(`🔍 Tìm thấy ${importedFabrics.length} vải hợp lệ.\n\n📥 Bạn có muốn thêm vào danh sách không?`)) {
          setFabrics(prev => [...prev, ...importedFabrics]);
          alert(`✅ Đã nhập thành công ${importedFabrics.length} vải vào danh mục!`);
          setShowImportModal(false);
          setImportText('');
        }
        
      } else if (importType === 'products') {
        const requiredHeaders = ['Mã sản phẩm', 'Tên sản phẩm'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          alert(`❌ Thiếu cột bắt buộc: ${missingHeaders.join(', ')}\n\n💡 Format đúng:\nMã sản phẩm,Tên sản phẩm,Loại,Mã vải,Định mức (m/bộ)`);
          return;
        }
        
        const importedProducts = data.map((row, index) => {
          const product = {
            id: Date.now() + index,
            code: row['Mã sản phẩm'] || '',
            name: row['Tên sản phẩm'] || '',
            type: row['Loại'] || '',
            fabricCode: row['Mã vải'] || '',
            fabricUsage: parseFloat(row['Định mức (m/bộ)'] || row['Định mức'] || 0)
          };
          
          if (!product.code || !product.name) {
            throw new Error(`Dòng ${index + 2}: Thiếu mã sản phẩm hoặc tên sản phẩm`);
          }
          return product;
        });
        
        if (window.confirm(`🔍 Tìm thấy ${importedProducts.length} sản phẩm hợp lệ.\n\n📥 Bạn có muốn thêm vào danh sách không?`)) {
          setProducts(prev => [...prev, ...importedProducts]);
          alert(`✅ Đã nhập thành công ${importedProducts.length} sản phẩm vào danh mục!`);
          setShowImportModal(false);
          setImportText('');
        }
      }
    } catch (error) {
      alert(`❌ Lỗi nhập dữ liệu: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Vải May</h1>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                style={{ display: 'none' }}
                id="backup-file-input"
              />
              <button
                onClick={() => document.getElementById('backup-file-input').click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm"
                title="Khôi phục dữ liệu từ file backup"
              >
                <Upload className="w-4 h-4" />
                Khôi phục
              </button>
              <button
                onClick={exportAllData}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 text-sm"
                title="Backup toàn bộ dữ liệu"
              >
                <Download className="w-4 h-4" />
                Backup
              </button>
              <button
                onClick={exportReport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 text-sm"
              >
                <FileText className="w-4 h-4" />
                Xuất báo cáo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Tổng quan</span>
            </button>
            <button
              onClick={() => setActiveTab('fabrics')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fabrics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Danh mục vải</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>Sản phẩm</span>
            </button>
            <button
              onClick={() => setActiveTab('production')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'production' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Sản xuất</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Tổng loại vải</p>
                    <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Tổng giá trị tồn</p>
                    <p className="text-2xl font-bold text-green-900">{totalValue.toLocaleString()}đ</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Vải sắp hết</p>
                    <p className="text-2xl font-bold text-red-900">{lowStock}</p>
                  </div>
                  <Warehouse className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Tổng vải đã dùng</p>
                    <p className="text-2xl font-bold text-purple-900">{totalUsed}m</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Vải sắp hết hàng</h3>
                <div className="space-y-3">
                  {fabrics.filter(f => f.currentLength < 150).map(fabric => (
                    <div key={fabric.id} className="flex items-center justify-between p-3 bg-red-50 rounded border-l-4 border-red-400">
                      <div>
                        <p className="font-medium text-red-800">{fabric.code} - {fabric.material}</p>
                        <p className="text-sm text-red-600">{fabric.color} - {fabric.width}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-red-600 font-bold text-lg">{fabric.currentLength}m</span>
                        <p className="text-xs text-red-500">⚠️ Cần nhập hàng</p>
                      </div>
                    </div>
                  ))}
                  {fabrics.filter(f => f.currentLength < 150).length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎉</div>
                      <p className="text-gray-600 text-lg">Tất cả vải đều đủ hàng (≥150m)</p>
                      <p className="text-green-600 font-semibold mt-2">✅ Kho vải ổn định!</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Sản xuất gần đây</h3>
                <div className="space-y-3">
                  {productionRecords.slice(-5).reverse().map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 border-blue-400">
                      <div>
                        <p className="font-medium text-blue-800">{record.productName}</p>
                        <p className="text-sm text-gray-600">📅 {record.date} - 📦 {record.quantity} bộ</p>
                        <p className="text-xs text-purple-600">💰 {(record.fabricValue || 0).toLocaleString()}đ</p>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-600 text-lg font-bold">{Math.round(record.fabricUsed * 10) / 10}m</span>
                        <p className="text-xs text-gray-500">vải sử dụng</p>
                      </div>
                    </div>
                  ))}
                  {productionRecords.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🏭</div>
                      <p className="text-gray-500">Chưa có lệnh sản xuất nào</p>
                      <p className="text-sm text-blue-600 mt-2">Thêm lệnh sản xuất để bắt đầu theo dõi!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fabrics Tab */}
        {activeTab === 'fabrics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Danh mục vải</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportFabrics}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Xuất dữ liệu
                </button>
                <button
                  onClick={() => {
                    setImportType('fabrics');
                    setImportText('');
                    setShowImportModal(true);
                  }}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Nhập dữ liệu
                </button>
                <button 
                  onClick={() => setShowFabricModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Thêm vải mới
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã vải</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chất liệu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Màu sắc</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khổ vải</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho (m)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {fabrics.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      Chưa có vải nào. Click "Thêm vải mới" để bắt đầu.
                    </td>
                  </tr>
                ) : (
                  fabrics.map((fabric) => (
                    <tr key={fabric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{fabric.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{fabric.material}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{fabric.color}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{fabric.width}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={fabric.currentLength < 150 ? 'text-red-600 font-bold' : 'text-gray-900'}>
                          {fabric.currentLength}m
                          {fabric.currentLength < 150 && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              ⚠️ Cần nhập hàng
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{fabric.price.toLocaleString()}đ</td>
                      <td className="px-6 py-4 whitespace-nowrap">{(fabric.currentLength * fabric.price).toLocaleString()}đ</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditFabric(fabric)}
                            className="text-blue-600 hover:text-blue-800 px-2 py-1 text-xs border border-blue-300 rounded"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDuplicateFabric(fabric)}
                            className="text-green-600 hover:text-green-800 px-2 py-1 text-xs border border-green-300 rounded"
                            title="Sao chép vải này"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteFabric(fabric.id)}
                            className="text-red-600 hover:text-red-800 px-2 py-1 text-xs border border-red-300 rounded"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportProducts}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Xuất dữ liệu
                </button>
                <button
                  onClick={() => {
                    setImportType('products');
                    setImportText('');
                    setShowImportModal(true);
                  }}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Nhập dữ liệu
                </button>
                <button
                  onClick={handleDeleteAllProducts}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 text-sm"
                  title="Xóa tất cả sản phẩm"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa hết
                </button>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  Thêm sản phẩm
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã vải</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Định mức (m/bộ)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Chưa có sản phẩm nào. Click "Thêm sản phẩm" để bắt đầu.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{product.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.fabricCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{product.fabricUsage}m</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800 px-2 py-1 text-xs border border-blue-300 rounded"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDuplicateProduct(product)}
                            className="text-green-600 hover:text-green-800 px-2 py-1 text-xs border border-green-300 rounded"
                            title="Sao chép sản phẩm này"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800 px-2 py-1 text-xs border border-red-300 rounded"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Production Tab */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Theo dõi sản xuất</h2>
              <div className="flex gap-3">
                <button
                  onClick={exportProduction}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Xuất dữ liệu
                </button>
                <button
                  onClick={() => setShowProductionModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4" />
                  Thêm lệnh sản xuất
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vải đã dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị vải</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {productionRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      Chưa có lệnh sản xuất nào. Click "Thêm lệnh sản xuất" để bắt đầu.
                    </td>
                  </tr>
                ) : (
                  productionRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{record.productCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{record.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{record.quantity} bộ</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">{Math.round(record.fabricUsed * 10) / 10}m</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">{record.fabricValue ? record.fabricValue.toLocaleString() : 0}đ</td>
                      <td className="px-6 py-4 whitespace-nowrap">{record.notes}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProduction(record)}
                            className="text-blue-600 hover:text-blue-800 px-2 py-1 text-xs border border-blue-300 rounded"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteProduction(record.id)}
                            className="text-red-600 hover:text-red-800 px-2 py-1 text-xs border border-red-300 rounded"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Import/Export Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {importType === 'export' ? '📄 Xuất dữ liệu CSV' : 
               importType === 'fabrics' ? '📥 Nhập danh mục vải' : 
               importType === 'products' ? '📥 Nhập danh mục sản phẩm' :
               '📥 Nhập dữ liệu'}
            </h3>
            
            {importType === 'export' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Copy toàn bộ nội dung bên dưới và lưu thành file .csv để mở bằng Excel:
                </p>
                <textarea
                  value={importText}
                  readOnly
                  className="w-full h-96 p-3 border rounded-lg font-mono text-sm bg-gray-50"
                  onClick={(e) => e.target.select()}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(importText);
                      alert('✅ Đã copy vào clipboard!');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    📋 Copy nội dung
                  </button>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Paste nội dung CSV vào ô bên dưới (bao gồm dòng tiêu đề):
                  </p>
                  {importType === 'fabrics' ? (
                    <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded mb-2">
                      <strong>📋 Format CSV cho DANH MỤC VẢI:</strong><br/>
                      <div className="font-mono mt-1 bg-white p-2 rounded border">
                        Mã vải,Chất liệu,Màu sắc,Khổ vải,Tồn kho (m),Đơn giá (đ)<br/>
                        VAI001,Cotton,Trắng,1.6m,100,50000<br/>
                        VAI002,Polyester,Xanh,2.0m,80,45000
                      </div>
                      <button
                        onClick={() => {
                          const sampleText = "Mã vải,Chất liệu,Màu sắc,Khổ vải,Tồn kho (m),Đơn giá (đ)\nVAI001,Cotton,Trắng,1.6m,100,50000\nVAI002,Polyester,Xanh,2.0m,80,45000";
                          setImportText(sampleText);
                        }}
                        className="mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        📋 Copy mẫu này vào ô nhập
                      </button>
                    </div>
                  ) : importType === 'products' ? (
                    <div className="text-xs text-green-600 bg-green-50 p-3 rounded mb-2">
                      <strong>📋 Format CSV cho DANH MỤC SẢN PHẨM:</strong><br/>
                      <div className="font-mono mt-1 bg-white p-2 rounded border">
                        Mã sản phẩm,Tên sản phẩm,Loại,Mã vải,Định mức (m/bộ)<br/>
                        SP001,Bộ chăn ga đôi,Bộ chăn ga,VAI001,5.5<br/>
                        SP002,Gối nằm,Gối,VAI002,1.2
                      </div>
                      <button
                        onClick={() => {
                          const sampleText = "Mã sản phẩm,Tên sản phẩm,Loại,Mã vải,Định mức (m/bộ)\nSP001,Bộ chăn ga đôi,Bộ chăn ga,VAI001,5.5\nSP002,Gối nằm,Gối,VAI002,1.2";
                          setImportText(sampleText);
                        }}
                        className="mt-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                      >
                        📋 Copy mẫu này vào ô nhập
                      </button>
                    </div>
                  ) : null}
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste dữ liệu CSV vào đây bao gồm cả dòng tiêu đề..."
                  className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleTextImport}
                    disabled={!importText.trim()}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      !importText.trim() 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    📥 Nhập dữ liệu
                  </button>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportText('');
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fabric Modal */}
      {showFabricModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingFabric ? 'Sửa thông tin vải' : 'Thêm vải mới'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mã vải *</label>
                <input
                  type="text"
                  value={fabricForm.code}
                  onChange={(e) => setFabricForm({...fabricForm, code: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="VAI001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chất liệu *</label>
                <input
                  type="text"
                  value={fabricForm.material}
                  onChange={(e) => setFabricForm({...fabricForm, material: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Cotton, Polyester, Satin..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Màu sắc</label>
                <input
                  type="text"
                  value={fabricForm.color}
                  onChange={(e) => setFabricForm({...fabricForm, color: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Trắng, Xanh..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Khổ vải</label>
                <input
                  type="text"
                  value={fabricForm.width}
                  onChange={(e) => setFabricForm({...fabricForm, width: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="1.6m, 2.0m..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số mét hiện có</label>
                <input
                  type="number"
                  value={fabricForm.currentLength}
                  onChange={(e) => setFabricForm({...fabricForm, currentLength: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đơn giá (đ/m)</label>
                <input
                  type="number"
                  value={fabricForm.price}
                  onChange={(e) => setFabricForm({...fabricForm, price: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="50000"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddFabric}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {editingFabric ? 'Cập nhật' : 'Thêm vải'}
              </button>
              <button
                onClick={() => {
                  setShowFabricModal(false);
                  setEditingFabric(null);
                  setFabricForm({ code: '', material: '', color: '', width: '', currentLength: '', price: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingProduct ? 'Sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mã sản phẩm *</label>
                <input
                  type="text"
                  value={productForm.code}
                  onChange={(e) => setProductForm({...productForm, code: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="SP001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Bộ chăn ga cotton"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loại sản phẩm</label>
                <select
                  value={productForm.type}
                  onChange={(e) => setProductForm({...productForm, type: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Chọn loại</option>
                  <option value="Bộ chăn ga">Bộ chăn ga</option>
                  <option value="Chăn">Chăn</option>
                  <option value="Gối">Gối</option>
                  <option value="Nệm">Nệm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mã vải sử dụng</label>
                <select
                  value={productForm.fabricCode}
                  onChange={(e) => setProductForm({...productForm, fabricCode: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Chọn mã vải</option>
                  {fabrics.map(fabric => (
                    <option key={fabric.id} value={fabric.code}>
                      {fabric.code} - {fabric.material} - {fabric.color}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Định mức vải (m/bộ) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={productForm.fabricUsage}
                  onChange={(e) => setProductForm({...productForm, fabricUsage: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="5.5"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
                {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
              </button>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  setProductForm({ code: '', name: '', fabricCode: '', fabricUsage: '', type: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Production Modal */}
      {showProductionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingProduction ? 'Sửa lệnh sản xuất' : 'Thêm lệnh sản xuất'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ngày sản xuất *</label>
                <input
                  type="date"
                  value={productionForm.date}
                  onChange={(e) => setProductionForm({...productionForm, date: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sản phẩm *</label>
                <select
                  value={productionForm.productCode}
                  onChange={(e) => setProductionForm({...productionForm, productCode: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map(product => (
                    <option key={product.id} value={product.code}>
                      {product.code} - {product.name} (Định mức: {product.fabricUsage}m/bộ)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số lượng sản xuất (bộ) *</label>
                <input
                  type="number"
                  value={productionForm.quantity}
                  onChange={(e) => setProductionForm({...productionForm, quantity: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <textarea
                  value={productionForm.notes}
                  onChange={(e) => setProductionForm({...productionForm, notes: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows={2}
                  placeholder="Đơn hàng X..."
                />
              </div>
              {productionForm.productCode && productionForm.quantity && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  {(() => {
                    const selectedProduct = products.find(p => p.code === productionForm.productCode);
                    const fabricNeeded = selectedProduct ? Math.round(selectedProduct.fabricUsage * parseInt(productionForm.quantity) * 10) / 10 : 0;
                    const fabric = selectedProduct ? fabrics.find(f => f.code === selectedProduct.fabricCode) : null;
                    const fabricValue = fabric ? fabricNeeded * fabric.price : 0;
                    
                    return (
                      <div className="text-sm space-y-1">
                        <p><strong>Vải cần sử dụng:</strong> <span className="text-blue-600 font-bold">{fabricNeeded}m</span></p>
                        <p><strong>Loại vải:</strong> {selectedProduct?.fabricCode}</p>
                        {fabric && (
                          <>
                            <p><strong>Vải hiện có:</strong> {fabric.currentLength}m</p>
                            <p><strong>Giá trị ước tính:</strong> <span className="text-green-600 font-bold">{fabricValue.toLocaleString()}đ</span></p>
                            {fabric.currentLength < fabricNeeded && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-red-700 text-xs font-medium">
                                  ❌ Không đủ vải! Thiếu {Math.round((fabricNeeded - fabric.currentLength) * 10) / 10}m
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddProduction}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
              >
                {editingProduction ? 'Cập nhật' : 'Thêm lệnh sản xuất'}
              </button>
              <button
                onClick={() => {
                  setShowProductionModal(false);
                  setEditingProduction(null);
                  setProductionForm({ date: '', productCode: '', quantity: '', notes: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Notification */}
      {showWelcomeNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-600 flex items-center gap-2">
                  🎉 Chào mừng đến với Hệ thống Quản Lý Vải May!
                </h3>
                <button
                  onClick={closeWelcomeNotification}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3 text-sm text-gray-700">
                <p className="flex items-start gap-2">
                  <span className="text-blue-500">📊</span>
                  <span>Hệ thống đã tải một số dữ liệu mẫu để bạn dễ dàng trải nghiệm.</span>
                </p>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-800 mb-2">💡 Các tính năng chính:</p>
                  <ul className="space-y-1 text-blue-700 text-xs">
                    <li>• 📋 Báo cáo HTML đẹp mắt với thống kê chi tiết</li>
                    <li>• 💾 Backup toàn bộ dữ liệu</li>
                    <li>• 🔄 Khôi phục dữ liệu từ file backup</li>
                    <li>• 🗑️ Xóa hết sản phẩm với một click</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-xs">
                    <span className="font-medium">⚠️ Lưu ý:</span> Dữ liệu sẽ mất khi refresh trang.
                    <br />
                    <span className="font-medium">💾 Khuyến nghị:</span> Hãy sử dụng tính năng "Backup" để lưu trữ dữ liệu của bạn!
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeWelcomeNotification}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  Đã hiểu, bắt đầu sử dụng! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricApp;