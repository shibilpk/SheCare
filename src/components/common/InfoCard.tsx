import { STYLE } from '@src/constants/app';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Colors {
  bgColor: string;
  borderColor: string;
  bulletColor: string;
  boldColor: string;
}

type Props = {
  title?: string;
  emoji?: string;
  insights: Array<string>;
  highlightColor?: Colors;
};

const renderHighlightedText = (text: string, boldColor: string) => {
  const parts = text.split(/(".*?")/);

  return parts.map((part, index) => {
    if (part.startsWith('"') && part.endsWith('"')) {
      return (
        <Text key={index} style={{ color: boldColor, fontWeight: '700' }}>
          {part.replace(/"/g, '')}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

const InfoCard: React.FC<Props> = ({
  title,
  emoji,
  insights,
  highlightColor = {
    bgColor: '#f0e6ff',
    borderColor: '#8641F4',
    bulletColor: '#8641F4',
    boldColor: '#333',
  },
}) => {
  return (
    <View
      style={[
        styles.card,
        styles.insightsCard,
        {
          borderLeftColor: highlightColor.borderColor,
          backgroundColor: highlightColor.bgColor,
        },
      ]}
    >
      {/* Header */}
      {title && (
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {title} {emoji}
          </Text>
        </View>
      )}

      {/* Content */}
      <View>
        {insights.map((item, index) => (
          <View key={index} style={styles.insightItem}>
            <View
              style={[
                styles.insightBullet,
                { backgroundColor: highlightColor.bulletColor },
              ]}
            />
            <Text style={styles.insightText}>
              {renderHighlightedText(item, highlightColor.boldColor)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default InfoCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#8641F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: STYLE.spacing.mv,
    gap: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  insightsCard: {
    borderLeftWidth: 4,
  },

  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    flex: 1,
  },
});
