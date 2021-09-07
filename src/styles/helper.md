### Spacing

.{property}{direction}-{size}

占位符 property 用来设置间距的类型：  
m - 对应 margin  
p - 对应 padding  

占位符 direction 指定属性所应用到的方向：t b l r x y a  
t -> top, b -> bottom, l -> left, r -> right, x -> left and right, y -> top and bottom, a -> all

The size controls the increment of the property in 4px intervals:  
* 0 - eliminates all margin or padding by setting it to 0
* 1 - sets margin or padding to 4px
* 2 - sets margin or padding to 8px
* 3 - sets margin or padding to 12px
* 4 - sets margin or padding to 16px
* 5 - sets margin or padding to 20px
* 6 - sets margin or padding to 24px
* 7 - sets margin or padding to 28px
* 8 - sets margin or padding to 32px
* 9 - sets margin or padding to 36px
* 10 - sets margin or padding to 40px
* 11 - sets margin or padding to 44px
* 12 - sets margin or padding to 48px
* n1 - sets negative margin to 4px
* n2 - sets negative margin to 8px
* n3 - sets negative margin to 12px
* n4 - sets negative margin to 16px
* n5 - sets negative margin to 20px
* n6 - sets negative margin to 24px
* n7 - sets negative margin to 28px
* n8 - sets negative margin to 32px
* n9 - sets negative margin to 36px
* n10 - sets negative margin to 40px
* n11 - sets negative margin to 44px
* n12 - sets negative margin to 48px
* auto - sets the spacing to auto

---

### Text
Control text alignment, wrapping, overflow, transforms and more.  

#### text-align
.text-{property}  
占位符 property 用来设置位置类型：left right center justify start end  

#### Text wrapping and overflow
.text-wrap  .text-no-wrap  .text-break  .text-truncate

#### text-transform
.text-{property}  
占位符 property 用来设置 transform 类型：none capitalize lowercase uppercase

#### Font weights
.fw-{property}  
占位符 property 用来设置weight: 
* 'thin': 100,
* 'light': 300,
* 'regular': 400,
* 'medium': 500,
* 'bold': 700,
* 'black': 900

---

### Flex
启用弹性盒子相关

* .d-flex
* .d-inline-flex

#### Flex direction
.flex-{direction} => flex-direction: direction    
direction: row column row-reverse column-reverse

#### Flex justify
.justify-{property} => justify-content: property   
property: start end center space-between space-around

#### Flex align
.align-{property} => align-items: property  
property: start end center baseline stretch

#### Flex align self
.align-self-{property}  
property: auto start end center baseline stretch

#### Flex wrap
* .flex-nowrap
* .flex-wrap
* .flex-wrap-reverse

#### Flex order
* .order-first
* .order-0
* .order-1
* .order-2
* .order-3
* .order-4
* .order-5
* .order-6
* .order-7
* .order-8
* .order-9
* .order-10
* .order-11
* .order-12
* .order-last

#### Flex align content
.align-content-{property} => align-content: property  
property: start end center space-between space-around stretch

#### Flex grow and shrink
* .flex-grow-0
* .flex-grow-1
* .flex-shrink-0
* .flex-shrink-1

---

### Display
指定元素的 display 属性  
.d-{value}  
value: none inline inline-block block table table-cell table-row flex inline-flex

---

#### Overflow
* .overflow-auto
* .overflow-hidden
* .overflow-visible


* .overflow-x-auto
* .overflow-x-hidden


* .overflow-y-auto
* .overflow-y-hidden

---

#### Float
* .float-none
* .float-left
* .float-right

---

### Transition
* fade-transition
* message-transition
* scale-transition
* expand-transition
* expand-x-transition
* slide-x-transition
* slide-x-reverse-transition
* scroll-x-transition
* scroll-x-reverse-transition
* scroll-y-transition
* scroll-y-reverse-transition
* slide-y-transition
* slide-y-reverse-transition
