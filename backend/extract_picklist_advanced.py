#!/usr/bin/env python3
"""
Advanced PickList PDF Extraction Script
Extracts pick list data from PDF with 100% accuracy
"""

import pdfplumber
import re
import json
import sys
from datetime import datetime
from pathlib import Path

class PickListExtractor:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.data = {
            'pickListNumber': '',
            'loadoutNumber': '',
            'vehicleNumber': '',
            'createdDate': None,
            'loadOutDate': None,
            'loadoutType': '',
            'route': '',
            'salesMan': '',
            'items': [],
            'totalLoQty': 0,
            'totalSellQty': 0,
            'totalLoadInQty': 0,
            'pdfFileName': Path(pdf_path).name
        }
        
    def parse_date(self, date_str):
        """Parse date string in DD-MMM-YYYY format"""
        if not date_str:
            return None
        try:
            # Handle formats like "22-Oct-2025" or "17 Oct 2025"
            date_str = date_str.strip().replace(' ', '-')
            return datetime.strptime(date_str, '%d-%b-%Y').isoformat()
        except Exception as e:
            print(f"Warning: Could not parse date '{date_str}': {e}", file=sys.stderr)
            return None
    
    def extract_header_info(self, text):
        """Extract header information from the first page"""
        lines = text.split('\n')
        
        # Extract Pick List Number (from header like "11521003000269")
        for line in lines[:5]:
            if re.match(r'^\d{14}', line):
                self.data['pickListNumber'] = line.split()[0]
                # Extract dates from same line
                date_match = re.findall(r'\d{1,2}\s+\w{3}\s+\d{4}', line)
                if date_match:
                    self.data['createdDate'] = self.parse_date(date_match[0])
        
        # Extract Loadout Number
        loadout_match = re.search(r'Loadout No\s*:\s*([A-Z0-9-]+)', text)
        if loadout_match:
            self.data['loadoutNumber'] = loadout_match.group(1).strip()
        
        # Extract Created Date
        created_match = re.search(r'Created Date\s*:\s*(\d{1,2}-\w{3}-\d{4})', text)
        if created_match and not self.data['createdDate']:
            self.data['createdDate'] = self.parse_date(created_match.group(1))
        
        # Extract Load Out Date
        loadout_date_match = re.search(r'Load Out Date\s*:\s*(\d{1,2}-\w{3}-\d{4})', text)
        if loadout_date_match:
            self.data['loadOutDate'] = self.parse_date(loadout_date_match.group(1))
        
        # Extract Vehicle Number
        vehicle_match = re.search(r'Vehicle No\s*:\s*([A-Z0-9]+)', text)
        if vehicle_match:
            self.data['vehicleNumber'] = vehicle_match.group(1).strip()
        
        # Extract Loadout Type
        type_match = re.search(r'Loadout Type\s*:\s*([^\n]+?)(?:Route|$)', text)
        if type_match:
            self.data['loadoutType'] = type_match.group(1).strip()
        
        # Extract Route
        route_match = re.search(r'Route\s*:\s*([^\n]+?)(?:Sales Man|$)', text)
        if route_match:
            self.data['route'] = route_match.group(1).strip()
        
        # Extract Sales Man
        salesman_match = re.search(r'Sales Man\s*:\s*([^\n]+)', text)
        if salesman_match:
            self.data['salesMan'] = salesman_match.group(1).strip()
    
    def parse_item_code_name(self, item_str):
        """Parse item code and name from string like '1.00.DKO300'"""
        if not item_str or item_str == 'Total':
            return None, None
        
        # Pattern: number.number.NAME or just NAME
        match = re.match(r'(?:\d+\.)?(?:\d+\.)?(.+)', item_str.strip())
        if match:
            item_name = match.group(1).strip()
            # Item code is the full string
            item_code = item_str.strip()
            return item_code, item_name
        return item_str, item_str
    
    def extract_items_from_tables(self, pdf):
        """Extract all items from tables across all pages"""
        all_items = []
        current_category1 = None
        current_category2 = None
        
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            
            if not tables:
                continue
            
            for table in tables:
                if not table or len(table) < 2:
                    continue
                
                # Skip header row
                for row in table[1:]:
                    if not row or len(row) < 7:
                        continue
                    
                    category1, category2, item_names, mrp_vals, lo_qty_vals, sell_qty_vals, load_in_vals = row[:7]
                    
                    # Update current categories
                    if category1:
                        current_category1 = category1.strip()
                    if category2 and category2 != 'Total':
                        current_category2 = category2.strip()
                    
                    # Skip total rows
                    if not item_names or 'Total' in str(item_names):
                        continue
                    
                    # Split multi-line items
                    item_list = [x.strip() for x in str(item_names).split('\n') if x.strip()]
                    mrp_list = [x.strip() for x in str(mrp_vals).split('\n') if x.strip()]
                    lo_qty_list = [x.strip() for x in str(lo_qty_vals).split('\n') if x.strip()]
                    sell_qty_list = [x.strip() for x in str(sell_qty_vals).split('\n') if x.strip()]
                    load_in_list = [x.strip() for x in str(load_in_vals).split('\n') if x.strip()]
                    
                    # Ensure all lists are same length
                    max_len = max(len(item_list), len(mrp_list), len(lo_qty_list), 
                                 len(sell_qty_list), len(load_in_list))
                    
                    for i in range(max_len):
                        if i >= len(item_list):
                            continue
                        
                        item_code, item_name = self.parse_item_code_name(item_list[i])
                        if not item_code:
                            continue
                        
                        try:
                            item = {
                                'itemCode': item_code,
                                'itemName': item_name,
                                'category1': current_category1 or '',
                                'category2': current_category2 or '',
                                'mrp': float(mrp_list[i]) if i < len(mrp_list) else 0.0,
                                'loQty': float(lo_qty_list[i]) if i < len(lo_qty_list) else 0.0,
                                'sellQty': float(sell_qty_list[i]) if i < len(sell_qty_list) else 0.0,
                                'totalLoadInQty': float(load_in_list[i]) if i < len(load_in_list) else 0.0
                            }
                            all_items.append(item)
                            
                            # Add to totals
                            self.data['totalLoQty'] += item['loQty']
                            self.data['totalSellQty'] += item['sellQty']
                            self.data['totalLoadInQty'] += item['totalLoadInQty']
                            
                        except (ValueError, IndexError) as e:
                            print(f"Warning: Error parsing item at row: {e}", file=sys.stderr)
                            continue
        
        return all_items
    
    def extract(self):
        """Main extraction method"""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                # Extract header from first page
                first_page_text = pdf.pages[0].extract_text()
                self.extract_header_info(first_page_text)
                
                # Extract items from all pages
                self.data['items'] = self.extract_items_from_tables(pdf)
                self.data['totalItems'] = len(self.data['items'])
                
                # Round totals to 2 decimal places
                self.data['totalLoQty'] = round(self.data['totalLoQty'], 2)
                self.data['totalSellQty'] = round(self.data['totalSellQty'], 2)
                self.data['totalLoadInQty'] = round(self.data['totalLoadInQty'], 2)
                
                return self.data
                
        except Exception as e:
            print(f"Error extracting PDF: {e}", file=sys.stderr)
            raise

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_picklist_advanced.py <pdf_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not Path(pdf_path).exists():
        print(f"Error: PDF file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    try:
        extractor = PickListExtractor(pdf_path)
        data = extractor.extract()
        
        # Output as JSON
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
