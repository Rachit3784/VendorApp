import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '../theme/useTheme';

const RatingStars = ({ rating, size = 16, max = 5 }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      {[...Array(max)].map((_, i) => {
        const isFilled = i < Math.floor(rating);
        return (
          <Star 
            key={i} 
            size={size} 
            color={isFilled ? colors.star : colors.starEmpty} 
            fill={isFilled ? colors.star : 'transparent'}
            style={{ marginRight: 2 }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});

export default RatingStars;
