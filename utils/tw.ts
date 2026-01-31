// Helper function to convert Tailwind classes to React Native styles
export const tw = (classes: string) => {
  const styles: any = {};
  const classArray = classes.split(' ').filter(Boolean);

  classArray.forEach(cls => {
    // Flex utilities
    if (cls === 'flex-1') styles.flex = 1;
    if (cls === 'flex-row') styles.flexDirection = 'row';
    if (cls === 'flex-col') styles.flexDirection = 'column';
    
    // Justify content
    if (cls === 'justify-center') styles.justifyContent = 'center';
    if (cls === 'justify-between') styles.justifyContent = 'space-between';
    if (cls === 'justify-end') styles.justifyContent = 'flex-end';
    if (cls === 'justify-start') styles.justifyContent = 'flex-start';
    
    // Align items
    if (cls === 'items-center') styles.alignItems = 'center';
    if (cls === 'items-end') styles.alignItems = 'flex-end';
    if (cls === 'items-start') styles.alignItems = 'flex-start';
    
    // Self alignment
    if (cls === 'self-center') styles.alignSelf = 'center';
    
    // Position
    if (cls === 'absolute') styles.position = 'absolute';
    if (cls === 'relative') styles.position = 'relative';
    
    // Width/Height
    if (cls === 'w-full') styles.width = '100%';
    if (cls.startsWith('w-')) {
      const match = cls.match(/w-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num <= 100) styles.width = `${num * 4}px`;
      }
      if (cls === 'w-15') styles.width = 60;
    }
    if (cls.startsWith('h-')) {
      const match = cls.match(/h-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.height = `${num * 4}px`;
      }
    }
    
    // Padding
    if (cls === 'p-2') styles.padding = 8;
    if (cls === 'p-3') styles.padding = 12;
    if (cls === 'p-4') styles.padding = 16;
    if (cls === 'p-5') styles.padding = 20;
    if (cls === 'p-10') styles.padding = 40;
    if (cls.startsWith('px-')) {
      const match = cls.match(/px-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.paddingHorizontal = num * 4;
      }
    }
    if (cls.startsWith('py-')) {
      const match = cls.match(/py-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.paddingVertical = num * 4;
      }
    }
    if (cls.startsWith('pt-')) {
      const match = cls.match(/pt-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.paddingTop = num * 4;
      }
    }
    if (cls.startsWith('pb-')) {
      const match = cls.match(/pb-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.paddingBottom = num * 4;
      }
    }
    if (cls.startsWith('pl-')) {
      const match = cls.match(/pl-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.paddingLeft = num * 4;
      }
    }
    if (cls.startsWith('pr-')) {
      const match = cls.match(/pr-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.paddingRight = num * 4;
      }
    }
    
    // Margin
    if (cls === 'mb-2') styles.marginBottom = 8;
    if (cls === 'mb-2.5') styles.marginBottom = 10;
    if (cls === 'mb-3') styles.marginBottom = 12;
    if (cls === 'mb-4') styles.marginBottom = 16;
    if (cls === 'mb-10') styles.marginBottom = 40;
    if (cls.startsWith('mx-')) {
      const match = cls.match(/mx-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.marginHorizontal = num * 4;
      }
    }
    if (cls.startsWith('my-')) {
      const match = cls.match(/my-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.marginVertical = num * 4;
      }
    }
    if (cls.startsWith('mt-')) {
      const match = cls.match(/mt-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.marginTop = num * 4;
      }
    }
    if (cls.startsWith('ml-')) {
      const match = cls.match(/ml-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.marginLeft = num * 4;
      }
    }
    if (cls.startsWith('mr-')) {
      const match = cls.match(/mr-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        styles.marginRight = num * 4;
      }
    }
    
    // Border radius
    if (cls === 'rounded') styles.borderRadius = 4;
    if (cls === 'rounded-sm') styles.borderRadius = 2;
    if (cls === 'rounded-md') styles.borderRadius = 6;
    if (cls === 'rounded-lg') styles.borderRadius = 8;
    if (cls === 'rounded-full') styles.borderRadius = 9999;
    
    // Background colors
    if (cls === 'bg-white') styles.backgroundColor = '#FFFFFF';
    if (cls === 'bg-gray-50') styles.backgroundColor = '#F9FAFB';
    if (cls === 'bg-gray-100') styles.backgroundColor = '#F3F4F6';
    if (cls === 'bg-gray-200') styles.backgroundColor = '#E5E7EB';
    if (cls === 'bg-gray-400') styles.backgroundColor = '#9CA3AF';
    if (cls === 'bg-gray-500') styles.backgroundColor = '#6B7280';
    if (cls === 'bg-gray-600') styles.backgroundColor = '#4B5563';
    if (cls === 'bg-blue-900') styles.backgroundColor = '#1E3A8A';
    if (cls === 'bg-green-500') styles.backgroundColor = '#10B981';
    if (cls === 'bg-red-500') styles.backgroundColor = '#EF4444';
    if (cls === 'bg-teal-500') styles.backgroundColor = '#14B8A6';
    if (cls === 'bg-orange-500') styles.backgroundColor = '#F97316';
    
    // Text colors
    if (cls === 'text-white') styles.color = '#FFFFFF';
    if (cls === 'text-gray-400') styles.color = '#9CA3AF';
    if (cls === 'text-gray-500') styles.color = '#6B7280';
    if (cls === 'text-gray-600') styles.color = '#4B5563';
    if (cls === 'text-gray-700') styles.color = '#374151';
    if (cls === 'text-gray-800') styles.color = '#1F2937';
    if (cls === 'text-blue-900') styles.color = '#1E3A8A';
    if (cls === 'text-green-500') styles.color = '#10B981';
    
    // Text size
    if (cls === 'text-xs') styles.fontSize = 12;
    if (cls === 'text-sm') styles.fontSize = 14;
    if (cls === 'text-base') styles.fontSize = 16;
    if (cls === 'text-lg') styles.fontSize = 18;
    if (cls === 'text-xl') styles.fontSize = 20;
    if (cls === 'text-2xl') styles.fontSize = 24;
    if (cls === 'text-3xl') styles.fontSize = 30;
    
    // Font weight
    if (cls === 'font-bold') styles.fontWeight = 'bold';
    if (cls === 'font-semibold') styles.fontWeight = '600';
    
    // Text align
    if (cls === 'text-center') styles.textAlign = 'center';
    if (cls === 'text-right') styles.textAlign = 'right';
    if (cls === 'text-left') styles.textAlign = 'left';
    
    // Border
    if (cls.startsWith('border-')) {
      if (cls === 'border') styles.borderWidth = 1;
      if (cls.match(/border-(\d+)/)) {
        const match = cls.match(/border-(\d+)/);
        if (match) styles.borderWidth = parseInt(match[1]);
      }
      if (cls.includes('border-gray-200')) styles.borderColor = '#E5E7EB';
      if (cls.includes('border-blue-900')) styles.borderColor = '#1E3A8A';
    }
    
    // Shadow
    if (cls === 'shadow-md') {
      styles.shadowColor = '#000';
      styles.shadowOffset = {width: 0, height: 2};
      styles.shadowOpacity = 0.1;
      styles.shadowRadius = 3;
      styles.elevation = 3;
    }
    
    // Flex shrink
    if (cls === 'flex-shrink-0') styles.flexShrink = 0;
    
    // Width percentages
    if (cls === 'w-7/25') styles.width = '28%';
    if (cls === 'w-8/25') styles.width = '32%';
    if (cls === 'w-5/25') styles.width = '20%';
    if (cls.startsWith('w-[') && cls.endsWith(']')) {
      const match = cls.match(/w-\[(.+)\]/);
      if (match) styles.width = match[1];
    }
    
    // Position values
    if (cls.startsWith('top-')) {
      const match = cls.match(/top-(\d+(?:\.\d+)?)/);
      if (match) {
        const num = parseFloat(match[1]);
        styles.top = num * 4;
      }
    }
    if (cls.startsWith('bottom-')) {
      const match = cls.match(/bottom-(\d+(?:\.\d+)?)/);
      if (match) {
        const num = parseFloat(match[1]);
        styles.bottom = num * 4;
      }
      if (cls === 'bottom-15') styles.bottom = 60;
    }
    if (cls.startsWith('left-')) {
      const match = cls.match(/left-(\d+(?:\.\d+)?)/);
      if (match) {
        const num = parseFloat(match[1]);
        styles.left = num * 4;
      }
      if (cls === 'left-0') styles.left = 0;
    }
    if (cls.startsWith('right-')) {
      const match = cls.match(/right-(\d+(?:\.\d+)?)/);
      if (match) {
        const num = parseFloat(match[1]);
        styles.right = num * 4;
      }
      if (cls === 'right-0') styles.right = 0;
    }
  });

  return styles;
};

