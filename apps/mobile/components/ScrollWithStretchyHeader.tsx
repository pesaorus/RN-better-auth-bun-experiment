import { Animated, Dimensions, StyleSheet, View } from "react-native"
import { useRef } from "react"

const HEADER_HEIGHT = 300
const { width } = Dimensions.get("window")

type Props = {
  imageSource: React.ComponentProps<typeof Animated.Image>["source"]
  children: React.ReactNode
}

export function ScrollWithStretchyHeader({ imageSource, children }: Props) {
  const scrollY = useRef(new Animated.Value(0)).current

  const headerHeight = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0],
    outputRange: [HEADER_HEIGHT * 2, HEADER_HEIGHT],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  })

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        bounces
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
      >
        <Animated.View style={{ height: headerHeight, width }}>
          <Animated.Image source={imageSource} style={styles.headerImage} resizeMode="cover" />
        </Animated.View>
        {children}
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width,
  },
})
