# Backend Integration Checklist ✅

## Admin Panel - Product Add Form

### ✅ Fields Present in Form

#### Basic Information
- ✅ Product Name
- ✅ Price (Type-specific):
  - Plain: Price per Meter
  - Design: Design Price
  - Digital: Base Price
- ✅ Category
- ✅ Subcategory
- ✅ Description (Rich Text Editor)

#### Type-Specific Fields

**PLAIN Product:**
- ✅ Price per Meter
- ✅ Variants (Width, GSM, Color, etc.)
- ✅ Variant Combinations with pricing

**DESIGNED Product:**
- ✅ Design Price
- ✅ Recommended Plain Product IDs (Max 10)
- ✅ Plain Product Selector

**DIGITAL Product:**
- ✅ Base Price
- ✅ Digital File Upload

#### Additional Features
- ✅ Custom Fields Builder
  - Type: text, image, input, dropdown
  - Label and Value
- ✅ Detail Sections Builder
  - Title and Content
  - Multiple sections supported
- ✅ Product Gallery (Image upload placeholder)

### ⚠️ Missing Fields (Need to Add)

1. **Status Field** (Active/Inactive)
   - Currently missing in form
   - Needed for backend

2. **Image Upload Handler**
   - Placeholder exists but no actual upload logic
   - Need file upload functionality

3. **Form Validation**
   - No validation before submit
   - Need required field checks

4. **Submit Handler**
   - "Create Product" button has no onClick handler
   - Need API call implementation

5. **Product Type Field**
   - Should be sent to backend explicitly
   - Currently only in formData state

## Price Calculations - Verification

### ✅ Design Product Calculation
**Current Implementation:**
```typescript
// In handleFabricVariantComplete
const totalPrice = (product.designPrice || 0) + data.totalPrice;
// where data.totalPrice = (fabricPricePerMeter * quantity) + variantModifiers
```

**Formula:** ✅ Correct
```
Total = Design Price + (Plain Product Price per Meter × Quantity) + Variant Modifiers
```

### ✅ Plain Product Calculation
**Current Implementation:**
```typescript
// In plainProductPrice useMemo
let basePrice = product.pricePerMeter || 0;
// Add variant modifiers
product.variants.forEach((variant) => {
  const selectedOption = variant.options.find(opt => opt.id === selectedOptionId);
  if (selectedOption?.priceModifier) {
    basePrice += selectedOption.priceModifier;
  }
});
return basePrice * quantity;
```

**Formula:** ✅ Correct
```
Total = (Price per Meter + Variant Modifiers) × Quantity
```

### ✅ Digital Product Calculation
**Current Implementation:**
```typescript
// Fixed price
const totalPrice = product.price;
```

**Formula:** ✅ Correct
```
Total = Fixed Price
```

## Data Structures for Backend

### Product Creation Payload (Admin)

```typescript
// PLAIN Product
{
  name: string;
  type: 'PLAIN';
  pricePerMeter: number;
  categoryId: string;
  subcategoryId: string;
  description: string;
  images: string[]; // Image URLs
  variants: VariantType[];
  variantCombinations: VariantCombination[];
  customFields: CustomField[];
  detailSections: DetailSection[];
  status: 'active' | 'inactive'; // MISSING
}

// DESIGNED Product
{
  name: string;
  type: 'DESIGNED';
  designPrice: number;
  categoryId: string;
  subcategoryId: string;
  description: string;
  images: string[]; // Design images
  recommendedPlainProductIds: string[]; // Max 10
  customFields: CustomField[];
  detailSections: DetailSection[];
  status: 'active' | 'inactive'; // MISSING
}

// DIGITAL Product
{
  name: string;
  type: 'DIGITAL';
  price: number;
  categoryId: string;
  subcategoryId: string;
  description: string;
  images: string[];
  digitalFileUrl: string;
  customFields: CustomField[];
  detailSections: DetailSection[];
  status: 'active' | 'inactive'; // MISSING
}
```

### Cart Item Structure

```typescript
// DESIGNED Product in Cart
{
  id: string;
  type: 'DESIGNED';
  designId: string;
  designPrice: number;
  plainProductId: string;
  plainProductPrice: number; // Total price including variants and quantity
  variants: Record<string, string>; // Selected variant option IDs
  quantity: number; // meters
  totalPrice: number; // designPrice + plainProductPrice
}

// PLAIN Product in Cart
{
  id: string;
  type: 'PLAIN';
  plainProductId: string;
  plainProductPrice: number; // Price per meter (with variant modifiers)
  variants: Record<string, string>;
  quantity: number; // meters
  totalPrice: number; // plainProductPrice * quantity
}

// DIGITAL Product in Cart
{
  id: string;
  type: 'DIGITAL';
  digitalProductId: string;
  price: number;
  quantity: 1;
  totalPrice: number;
}
```

## Required Backend APIs

### Product APIs
- ✅ `POST /api/admin/products` - Create product
- ✅ `GET /api/products` - Get all products (with type filter)
- ✅ `GET /api/products/{id}` - Get product details
- ✅ `GET /api/products?type=PLAIN` - Get plain products
- ✅ `GET /api/products?type=DESIGNED` - Get design products
- ✅ `GET /api/products?type=DIGITAL` - Get digital products
- ✅ `PUT /api/admin/products/{id}` - Update product
- ✅ `DELETE /api/admin/products/{id}` - Delete product

### Cart APIs
- ✅ `POST /api/cart` - Add to cart
- ✅ `GET /api/cart` - Get cart items
- ✅ `PUT /api/cart/{id}` - Update cart item
- ✅ `DELETE /api/cart/{id}` - Remove from cart

## Issues to Fix

### 1. Admin Form - Missing Status Field
**Location:** `AdminProducts.tsx`
**Fix:** Add status toggle/select in form

### 2. Admin Form - Missing Submit Handler
**Location:** `AdminProducts.tsx` - Line 309 (Create Product button)
**Fix:** Add onClick handler with API call

### 3. Admin Form - Image Upload
**Location:** `AdminProducts.tsx` - Line 295 (Image Gallery)
**Fix:** Implement actual file upload

### 4. Form Validation
**Location:** `AdminProducts.tsx`
**Fix:** Add validation before submit

## Summary

✅ **Price Calculations:** All correct
✅ **Data Structures:** Well defined
✅ **Form Fields:** Almost complete (missing status)
⚠️ **Form Submission:** Not implemented
⚠️ **Image Upload:** Placeholder only
⚠️ **Validation:** Not implemented

**Ready for Backend:** 85% - Need to add status field and submit handler
