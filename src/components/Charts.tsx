import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Rect, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop, G, Line } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');

const C = {
  bg: '#0D0800', card: '#1E1000', card2: '#2C1A00', card3: '#3D2400',
  gold: '#C8860A', goldLight: '#E8A830', goldDim: '#8B5E07',
  green: '#2E5016', greenLight: '#4A8C28',
  text: '#F5EDD8', muted: '#A89070', border: '#C8860A25',
};

// ── Donut / Ring chart ────────────────────────────────────────────────────────
interface DonutProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  centerLabel?: string;
  centerSub?: string;
}
export const DonutRing: React.FC<DonutProps> = ({
  percentage,
  size = 140,
  strokeWidth = 10,
  color = C.gold,
  bgColor = C.card2,
  centerLabel,
  centerSub,
}) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(percentage, 100) / 100);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={C.goldLight} />
            <Stop offset="100%" stopColor={C.gold} />
          </SvgGradient>
        </Defs>
        {/* Track */}
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        {/* Progress */}
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {centerLabel ? (
          <>
            <SvgText
              x={cx} y={cy - 4}
              textAnchor="middle"
              fontSize="22"
              fontWeight="800"
              fill={C.goldLight}
            >
              {centerLabel}
            </SvgText>
            {centerSub ? (
              <SvgText x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill={C.muted}>
                {centerSub}
              </SvgText>
            ) : null}
          </>
        ) : (
          <SvgText x={cx} y={cy + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill={C.goldLight}>
            {Math.round(percentage)}%
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

// ── Horizontal Bar Chart ──────────────────────────────────────────────────────
interface HBarItem { label: string; value: number; color?: string; emoji?: string }
interface HBarProps { data: HBarItem[]; title?: string; unit?: string }

export const HorizontalBarChart: React.FC<HBarProps> = ({ data, title, unit = '' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const anims = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: data[i].value / max,
        duration: 900 + i * 100,
        delay: i * 80,
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  }, []);

  const BAR_MAX = SW - 160;

  return (
    <View style={hbs.wrap}>
      {title ? <Text style={hbs.title}>{title}</Text> : null}
      {data.map((item, i) => (
        <View key={i} style={hbs.row}>
          <View style={hbs.labelWrap}>
            {item.emoji ? <Text style={hbs.emoji}>{item.emoji}</Text> : null}
            <Text style={hbs.label} numberOfLines={1}>{item.label}</Text>
          </View>
          <View style={hbs.track}>
            <Animated.View
              style={[
                hbs.fill,
                {
                  width: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, BAR_MAX] }),
                  backgroundColor: item.color ?? C.gold,
                },
              ]}
            />
          </View>
          <Text style={hbs.val}>{item.value.toLocaleString()}{unit}</Text>
        </View>
      ))}
    </View>
  );
};

const hbs = StyleSheet.create({
  wrap:      { gap: 10 },
  title:     { fontSize: 11, fontWeight: '800', color: C.gold, letterSpacing: 2, marginBottom: 4 },
  row:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelWrap: { width: 88, flexDirection: 'row', alignItems: 'center', gap: 4 },
  emoji:     { fontSize: 13 },
  label:     { fontSize: 11, color: C.text, fontWeight: '600', flex: 1 },
  track:     { flex: 1, height: 8, backgroundColor: C.card2, borderRadius: 4, overflow: 'hidden' },
  fill:      { height: 8, borderRadius: 4 },
  val:       { width: 36, fontSize: 10, color: C.muted, textAlign: 'right', fontWeight: '700' },
});

// ── Vertical Bar Chart (hourly) ───────────────────────────────────────────────
interface VBarItem { label: string; value: number; active?: boolean }
interface VBarProps { data: VBarItem[]; height?: number }

const VBarColumn: React.FC<{ item: VBarItem; pct: number; maxH: number }> = ({ item, pct, maxH }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 800, delay: 200 + Math.random() * 100, useNativeDriver: false }).start();
  }, []);

  return (
    <View style={vbs.col}>
      <Text style={vbs.topVal}>{item.value}</Text>
      <View style={[vbs.colInner, { height: maxH }]}>
        <Animated.View
          style={[
            vbs.bar,
            {
              height: anim.interpolate({ inputRange: [0, 1], outputRange: [2, maxH] }),
              backgroundColor: item.active ? C.goldLight : C.card3,
              borderColor: item.active ? C.gold : C.border,
            },
          ]}
        />
      </View>
      <Text style={[vbs.label, item.active && { color: C.goldLight }]}>{item.label}</Text>
    </View>
  );
};

export const VerticalBarChart: React.FC<VBarProps> = ({ data, height = 110 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <View style={vbs.wrap}>
      {data.map((item, i) => (
        <VBarColumn key={i} item={item} pct={item.value / max} maxH={height} />
      ))}
    </View>
  );
};

const vbs = StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  col:      { flex: 1, alignItems: 'center', gap: 2 },
  colInner: { justifyContent: 'flex-end', width: '100%' },
  bar:      { width: '100%', borderRadius: 4, borderWidth: 1 },
  topVal:   { fontSize: 9, color: C.muted, fontWeight: '600' },
  label:    { fontSize: 9, color: C.muted, fontWeight: '700', letterSpacing: 0.3 },
});

// ── Stat Pill (animated fade-in) ──────────────────────────────────────────────
interface StatPillProps { icon: string; value: string; label: string; accent?: string }
export const StatPill: React.FC<StatPillProps> = ({ icon, value, label, accent = C.gold }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[sps.wrap, { opacity, transform: [{ translateY }] }]}>
      <View style={[sps.iconWrap, { borderColor: accent + '40' }]}>
        <Text style={sps.icon}>{icon}</Text>
      </View>
      <Text style={[sps.value, { color: accent }]}>{value}</Text>
      <Text style={sps.label}>{label}</Text>
    </Animated.View>
  );
};

const sps = StyleSheet.create({
  wrap:     { flex: 1, alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, gap: 4 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  icon:     { fontSize: 18 },
  value:    { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  label:    { fontSize: 9, color: C.muted, fontWeight: '700', letterSpacing: 0.8, textAlign: 'center' },
});
