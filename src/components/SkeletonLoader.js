import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsDarkMode } from '../redux/themeSlice';
import { getColors } from '../utils/constants';

const SkeletonLoader = ({ width = '100%', height = 20, borderRadius = 8, style }) => {
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDarkMode ? '#333' : '#E0E0E0',
          opacity,
        },
        style,
      ]}
    />
  );
};

// Pre-built skeleton components
export const LeagueCardSkeleton = () => {
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);

  return (
    <View style={[styles.leagueCardSkeleton, { backgroundColor: COLORS.card }]}>
      <SkeletonLoader width={80} height={80} borderRadius={12} />
      <View style={styles.leagueInfoSkeleton}>
        <SkeletonLoader width="80%" height={20} borderRadius={4} />
        <SkeletonLoader width="60%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonLoader width="40%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

export const TeamCardSkeleton = () => {
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);

  return (
    <View style={[styles.teamCardSkeleton, { backgroundColor: COLORS.card }]}>
      <SkeletonLoader width={50} height={50} borderRadius={25} />
      <View style={styles.teamInfoSkeleton}>
        <SkeletonLoader width="70%" height={18} borderRadius={4} />
        <SkeletonLoader width="50%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

export const MatchCardSkeleton = () => {
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);

  return (
    <View style={[styles.matchCardSkeleton, { backgroundColor: COLORS.card }]}>
      <View style={styles.matchHeaderSkeleton}>
        <SkeletonLoader width="40%" height={14} borderRadius={4} />
        <SkeletonLoader width={60} height={20} borderRadius={10} />
      </View>
      <View style={styles.matchTeamsSkeleton}>
        <View style={styles.teamSkeleton}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <SkeletonLoader width={80} height={16} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
        <SkeletonLoader width={40} height={24} borderRadius={4} />
        <View style={styles.teamSkeleton}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <SkeletonLoader width={80} height={16} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
      </View>
      <SkeletonLoader width="60%" height={14} borderRadius={4} style={{ marginTop: 12 }} />
    </View>
  );
};

export const PlayerCardSkeleton = () => {
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);

  return (
    <View style={[styles.playerCardSkeleton, { backgroundColor: COLORS.card }]}>
      <SkeletonLoader width={60} height={60} borderRadius={30} />
      <View style={styles.playerInfoSkeleton}>
        <SkeletonLoader width="70%" height={16} borderRadius={4} />
        <SkeletonLoader width="50%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

export const FavoriteLeagueCardSkeleton = () => {
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);

  return (
    <View style={[styles.favoriteLeagueCardSkeleton, { backgroundColor: COLORS.white }]}>
      <SkeletonLoader width={50} height={50} borderRadius={8} />
      <View style={styles.favoriteLeagueInfoSkeleton}>
        <SkeletonLoader width="70%" height={16} borderRadius={4} />
        <SkeletonLoader width="50%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
    </View>
  );
};

export const HomeScreenSkeleton = () => (
  <View style={styles.homeSkeletonContainer}>
    <View style={styles.searchSkeleton}>
      <SkeletonLoader width="100%" height={50} borderRadius={25} />
    </View>
    <View style={styles.countrySkeleton}>
      <SkeletonLoader width="30%" height={40} borderRadius={20} style={{ marginRight: 8 }} />
      <SkeletonLoader width="30%" height={40} borderRadius={20} style={{ marginRight: 8 }} />
      <SkeletonLoader width="30%" height={40} borderRadius={20} />
    </View>
    <SkeletonLoader width="40%" height={24} borderRadius={4} style={{ marginLeft: 15, marginTop: 20 }} />
    <View style={styles.leaguesSkeleton}>
      <LeagueCardSkeleton />
      <LeagueCardSkeleton />
    </View>
    <SkeletonLoader width="40%" height={24} borderRadius={4} style={{ marginLeft: 15, marginTop: 20 }} />
    <View style={styles.matchesSkeleton}>
      <MatchCardSkeleton />
      <MatchCardSkeleton />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  leagueCardSkeleton: {
    width: 280,
    height: 160,
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leagueInfoSkeleton: {
    marginTop: 12,
  },
  teamCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamInfoSkeleton: {
    marginLeft: 15,
    flex: 1,
  },
  matchCardSkeleton: {
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  matchHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  matchTeamsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  teamSkeleton: {
    alignItems: 'center',
  },
  playerCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  playerInfoSkeleton: {
    marginLeft: 12,
    flex: 1,
  },
  favoriteLeagueCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  favoriteLeagueInfoSkeleton: {
    marginLeft: 15,
    flex: 1,
  },
  homeSkeletonContainer: {
    flex: 1,
    paddingTop: 20,
  },
  searchSkeleton: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  countrySkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  leaguesSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 15,
  },
  matchesSkeleton: {
    marginTop: 15,
  },
});

export default SkeletonLoader;
