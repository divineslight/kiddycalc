import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

type Operator = '+' | '-' | '×' | '÷' | null;

export default function HomeScreen() {
  const [display, setDisplay] = useState('0');
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const cuteTitle = useMemo(() => {
    const faces = ['🐣', '🦄', '🍭', '🌈', '🐼', '⭐️'];
    return `Kiddy Calc ${faces[Math.floor(Math.random() * faces.length)]}`;
  }, []);

  const equation = useMemo(() => {
    if (operator && pendingValue !== null) {
      // If second operand not entered yet, show just "A op"
      if (display === '') return `${formatNumberShort(pendingValue)} ${operator}`;
      return `${formatNumberShort(pendingValue)} ${operator} ${display}`;
    }
    return display;
  }, [operator, pendingValue, display]);

  const inputDigit = (digit: string) => {
    setDisplay((prev) => {
      if (justEvaluated) {
        setJustEvaluated(false);
        return digit;
      }
      if (prev === '0' || prev === '') return digit;
      if (prev.length >= 10) return prev; // keep it simple for kids
      return prev + digit;
    });
  };

  const inputDot = () => {
    setDisplay((prev) => {
      if (justEvaluated) {
        setJustEvaluated(false);
        return '0.';
      }
      if (prev === '') return '0.';
      return prev.includes('.') ? prev : prev + '.';
    });
  };

  const clearAll = () => {
    setDisplay('0');
    setPendingValue(null);
    setOperator(null);
    setJustEvaluated(false);
  };

  const setOp = (next: Exclude<Operator, null>) => {
    // If no first value yet, use current display; else if second value not entered, just change the op
    const hasSecond = display !== '' && !(display === '0' && justEvaluated);
    if (pendingValue === null) {
      setPendingValue(parseFloat(display));
    } else if (hasSecond && !justEvaluated && operator) {
      const result = compute(pendingValue, parseFloat(display), operator);
      setPendingValue(result);
      setDisplay(formatNumber(result));
    }
    setOperator(next);
    setJustEvaluated(false);
    // Prepare for second operand without showing 0
    setDisplay('');
  };

  const equals = () => {
    if (operator === null || pendingValue === null || display === '') return;
    const current = parseFloat(display);
    const result = compute(pendingValue, current, operator);
    setDisplay(formatNumber(result));
    setPendingValue(null);
    setOperator(null);
    setJustEvaluated(true);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {cuteTitle}
        </ThemedText>
      </View>

      <View style={styles.display}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {equation}
        </Text>
      </View>

      <View style={styles.grid}>
        {/* Row 1 */}
        <CalcButton label="7" onPress={() => inputDigit('7')} color="#FFD9E3" emoji="🐣" />
        <CalcButton label="8" onPress={() => inputDigit('8')} color="#FFE6AA" emoji="🦒" />
        <CalcButton label="9" onPress={() => inputDigit('9')} color="#C7F2FF" emoji="🐳" />
        <CalcButton label="÷" onPress={() => setOp('÷')} color="#FFB3C7" important />

        {/* Row 2 */}
        <CalcButton label="4" onPress={() => inputDigit('4')} color="#D7F9D7" emoji="🐢" />
        <CalcButton label="5" onPress={() => inputDigit('5')} color="#E6D9FF" emoji="🦄" />
        <CalcButton label="6" onPress={() => inputDigit('6')} color="#FFF3B0" emoji="🐤" />
        <CalcButton label="×" onPress={() => setOp('×')} color="#FFB3C7" important />

        {/* Row 3 */}
        <CalcButton label="1" onPress={() => inputDigit('1')} color="#FFEDD5" emoji="🐼" />
        <CalcButton label="2" onPress={() => inputDigit('2')} color="#D1F7FF" emoji="🐬" />
        <CalcButton label="3" onPress={() => inputDigit('3')} color="#E3FFD9" emoji="🦕" />
        <CalcButton label="-" onPress={() => setOp('-')} color="#FFB3C7" important />

        {/* Row 4 */}
        <CalcButton label="C" onPress={clearAll} color="#FFD6E7" />
        <CalcButton label="0" onPress={() => inputDigit('0')} color="#D6F4FF" emoji="⭐️" />
        <CalcButton label="." onPress={inputDot} color="#E5E0FF" />
        <CalcButton label="+" onPress={() => setOp('+')} color="#FFB3C7" important />

        {/* Row 5 (wide equals) */}
        <CalcButton label="=" onPress={equals} color="#FF86C8" important wide />
      </View>
    </ThemedView>
  );
}

function compute(a: number, b: number, op: Exclude<Operator, null>) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b === 0 ? NaN : a / b;
  return NaN;
}

function formatNumber(n: number) {
  if (!isFinite(n) || isNaN(n)) return 'Oops!';
  const str = n.toString();
  return str.length > 10 ? n.toFixed(4) : str;
}

function formatNumberShort(n: number) {
  const str = n.toString();
  return str.length > 10 ? n.toFixed(2) : str;
}

type CalcButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
  emoji?: string;
  important?: boolean;
  wide?: boolean;
};

function CalcButton({ label, onPress, color = '#eee', emoji, important, wide }: CalcButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: pressed ? 0.7 : 1 },
        important && styles.buttonImportant,
        wide && styles.buttonWide,
      ]}
    >
      <Text style={[styles.buttonText, important && styles.buttonTextImportant]}>{label}</Text>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFF9FB',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
  },
  display: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  displayText: {
    fontSize: 40,
    fontFamily: Fonts.rounded,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  buttonWide: {
    width: '46%',
  },
  buttonImportant: {
    borderWidth: 2,
    borderColor: '#FF6FA5',
  },
  buttonText: {
    fontSize: 28,
    fontFamily: Fonts.rounded,
  },
  buttonTextImportant: {
    color: '#D91E63',
    fontWeight: '700',
  },
  emoji: {
    fontSize: 14,
    marginTop: 2,
  },
});
