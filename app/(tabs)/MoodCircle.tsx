import React, { useState } from 'react';
import { Dimensions, PanResponder, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface MoodCircleProps {
  onMoodChange: (value: number) => void;
  color: string;
}

const { width } = Dimensions.get('window');
const SIZE = width * 0.7;
const STROKE_WIDTH = 20;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;

export default function MoodCircle({ onMoodChange, color }: MoodCircleProps) {
  const [angle, setAngle] = useState(0);

  const updateAngle = (gestureX: number, gestureY: number) => {
    const x = gestureX - CENTER;
    const y = gestureY - CENTER;
    let newAngle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (newAngle < 0) newAngle += 360;
    
    setAngle(newAngle);
    onMoodChange(Math.round((newAngle / 360) * 100));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      // 這裡簡化處理，實際建議使用組件內的相對座標
      updateAngle(gestureState.moveX - (width - SIZE) / 2, gestureState.moveY - 150);
    },
  });

  const handleX = CENTER + RADIUS * Math.cos((angle - 90) * (Math.PI / 180));
  const handleY = CENTER + RADIUS * Math.sin((angle - 90) * (Math.PI / 180));

  return (
    <View style={{ width: SIZE, height: SIZE }} {...panResponder.panHandlers}>
      <Svg width={SIZE} height={SIZE}>
        {/* 底環 */}
        <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="#E0E0E0" strokeWidth={STROKE_WIDTH} fill="none" />
        {/* 進度環 */}
        <Circle
          cx={CENTER} cy={CENTER} r={RADIUS}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${(angle / 360) * (2 * Math.PI * RADIUS)} ${2 * Math.PI * RADIUS}`}
          strokeLinecap="round"
          transform={`rotate(-90, ${CENTER}, ${CENTER})`}
        />
        {/* 控制點 */}
        <Circle cx={handleX} cy={handleY} r={15} fill="white" stroke={color} strokeWidth={3} />
      </Svg>
    </View>
  );
}