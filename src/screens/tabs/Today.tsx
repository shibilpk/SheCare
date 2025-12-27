import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const TodayScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Today</Text>
      </View>
    );
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      marginBottom: 24,
    },
  });


export default TodayScreen

