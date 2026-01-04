
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

export interface TabBarItem {
  name: string;
  route: Href;
  icon: keyof typeof MaterialIcons.glyphMap;
  iosIcon?: string;
  label: string;
  isCenter?: boolean;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = screenWidth * 0.9,
  borderRadius = 35,
  bottomMargin = 20
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const animatedValue = useSharedValue(0);

  // Improved active tab detection
  const activeTabIndex = React.useMemo(() => {
    // Normalize pathname by removing trailing slashes
    const normalizedPath = pathname.replace(/\/$/, '');
    
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const normalizedRoute = String(tab.route).replace(/\/$/, '');
      
      // Exact match
      if (normalizedPath === normalizedRoute) {
        return i;
      }
      
      // Check if current path starts with tab route (for nested routes)
      if (normalizedPath.startsWith(normalizedRoute) && normalizedRoute !== '') {
        return i;
      }
      
      // Check if pathname contains the tab name (handle nested routes)
      const tabNameMatch = tab.name.replace(/[()]/g, ''); // Remove parentheses
      if (normalizedPath.includes(`/${tabNameMatch}`)) {
        return i;
      }
    }
    
    // Default to first tab
    return 0;
  }, [pathname, tabs]);

  React.useEffect(() => {
    animatedValue.value = withSpring(activeTabIndex, {
      damping: 20,
      stiffness: 120,
      mass: 1,
    });
  }, [activeTabIndex]);

  const handleTabPress = (route: Href, index: number) => {
    router.push(route);
  };

  const tabWidthPercent = ((100 / tabs.length) - 1).toFixed(2);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (containerWidth - 8) / tabs.length;
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            tabs.map((_, i) => i),
            tabs.map((_, i) => tabWidth * i)
          ),
        },
      ],
    };
  });

  const dynamicStyles = {
    blurContainer: {
      ...styles.blurContainer,
      borderWidth: 1.2,
      borderColor: theme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
      ...Platform.select({
        ios: {
          backgroundColor: theme.dark
            ? 'rgba(28, 28, 30, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
        },
        android: {
          backgroundColor: theme.dark
            ? 'rgba(28, 28, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
        },
        web: {
          backgroundColor: theme.dark
            ? 'rgba(28, 28, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      }),
    },
    indicator: {
      ...styles.indicator,
      backgroundColor: theme.dark
        ? 'rgba(167, 139, 250, 0.2)' // Purple with transparency
        : 'rgba(139, 92, 246, 0.15)',
      width: `${tabWidthPercent}%` as `${number}%`,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[
        styles.container,
        {
          width: containerWidth,
          marginBottom: bottomMargin
        }
      ]}>
        <BlurView
          intensity={80}
          style={[dynamicStyles.blurContainer, { borderRadius }]}
        >
          <Animated.View style={[dynamicStyles.indicator, indicatorStyle]} />
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;
              const isCenter = tab.isCenter === true;

              return (
                <TouchableOpacity
                  key={`tab-${index}-${tab.name}`}
                  style={[
                    styles.tab,
                    isCenter && styles.centerTab
                  ]}
                  onPress={() => handleTabPress(tab.route, index)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.tabContent,
                    isCenter && styles.centerTabContent
                  ]}>
                    {isCenter ? (
                      <View style={[
                        styles.centerIconContainer,
                        {
                          backgroundColor: isActive 
                            ? theme.colors.primary 
                            : (theme.dark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'),
                          borderColor: theme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        }
                      ]}>
                        <IconSymbol
                          android_material_icon_name={tab.icon}
                          ios_icon_name={tab.iosIcon || tab.icon}
                          size={32}
                          color={isActive ? '#FFFFFF' : (theme.dark ? '#FFFFFF' : theme.colors.primary)}
                        />
                      </View>
                    ) : (
                      <IconSymbol
                        android_material_icon_name={tab.icon}
                        ios_icon_name={tab.iosIcon || tab.icon}
                        size={24}
                        color={isActive ? theme.colors.primary : (theme.dark ? '#98989D' : '#8E8E93')}
                      />
                    )}
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: theme.dark ? '#98989D' : '#8E8E93' },
                        isActive && { 
                          color: theme.colors.primary, 
                          fontWeight: '600' 
                        },
                        isCenter && styles.centerTabLabel
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  container: {
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 27,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 10,
  },
  centerTab: {
    marginTop: -20,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  centerTabContent: {
    gap: 4,
  },
  centerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  centerTabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
