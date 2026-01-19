/**
 * ============================================================================
 * SHARE BUTTON COMPONENT
 * ============================================================================
 * 
 * Reusable share button that opens the share card modal
 */

import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, borderRadius } from '@/styles/commonStyles';
import ShareCardModal from './ShareCardModal';
import { ShareCardData } from '@/utils/shareCardGenerator';
import * as Haptics from 'expo-haptics';

interface ShareButtonProps {
  data: ShareCardData;
  size?: number;
  color?: string;
}

export default function ShareButton({ data, size = 24, color = colors.primary }: ShareButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.button}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <IconSymbol
          ios_icon_name="square.and.arrow.up"
          android_material_icon_name="share"
          size={size}
          color={color}
        />
      </TouchableOpacity>

      <ShareCardModal
        visible={modalVisible}
        data={data}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
  },
});
