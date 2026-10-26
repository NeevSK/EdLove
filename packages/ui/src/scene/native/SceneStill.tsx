/**
 * The still layer of a scene, as a Skia element tree: sky, sun or moon, hills, the wewa, paddy
 * and palms. It holds no animated values, so its canvas draws once and redraws only when the
 * scene changes (about once a minute). Pure Skia elements, so it also renders headless for the
 * screenshot grid (`scripts/scene-shots.mjs`).
 */

import {
  daylightAt,
  SCENE_LIGHT as L,
  type Landscape,
  type LandscapeColours,
  mixHex,
  type Scene,
  WEATHER,
} from '@repo/core/scene';
import {
  Circle,
  Group,
  LinearGradient,
  Oval,
  Path,
  RadialGradient,
  Rect,
  vec,
} from 'react-native-skia';

export interface SceneStillProps {
  scene: Scene;
  landscape: Landscape;
  colours: LandscapeColours;
  /** The world's glow, which warms the low sun. */
  glow: string;
  /** Draw only the sky down to this height (the band presence); the whole scene when omitted. */
  clipHeight?: number;
}

const alpha = (hex: string, a: number) => {
  const v = Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${v}`;
};

export function SceneStill({
  scene,
  landscape: ls,
  colours: c,
  glow,
  clipHeight,
}: SceneStillProps) {
  const palette = scene.palette;
  if (!palette) return null;
  const W = ls.width;
  const H = ls.height;
  const hy = ls.horizonY;
  const wx = WEATHER[scene.weather];
  const veil = 1 - wx.cloud * 0.8;
  const light = daylightAt(scene.minute);
  const cel = scene.celestial;
  const cx = W * cel.x;
  const cy = hy - cel.lift * hy + 10;
  const day = cel.body === 'sun';
  const sunLow = day ? Math.max(0, 1 - cel.lift * 2.8) : 0;
  const moonR = Math.max(11, W * 0.013);
  const moonShift =
    scene.moonPhase < 0.5
      ? -moonR * 2 * (scene.moonPhase / 0.5)
      : moonR * 2 * ((1 - scene.moonPhase) / 0.5);
  const cloudColour = mixHex(palette.horizon, light > 0.3 ? L.white : L.cloudNight, 0.35);
  const cloudAlpha = 0.14 + wx.cloud * 0.36;
  const showStars = scene.particles.stars > 0;

  return (
    <Group clip={clipHeight ? { x: 0, y: 0, width: W, height: clipHeight } : undefined}>
      <Rect x={0} y={0} width={W} height={hy + 2}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, hy)}
          colors={[palette.top, mixHex(palette.top, palette.horizon, 0.7), palette.horizon]}
          positions={[0, 0.72, 1]}
        />
      </Rect>

      {showStars
        ? ls.stars
            .slice(0, scene.particles.stars * 4)
            .map((s, i) => (
              <Circle
                key={`s${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r * 0.8}
                color={alpha(L.star, (0.45 + (i % 5) * 0.08) * (1 - wx.cloud))}
              />
            ))
        : null}

      {day ? (
        <Group>
          <Rect x={0} y={0} width={W} height={hy}>
            <RadialGradient
              c={vec(cx, cy)}
              r={Math.max(W, H) * 0.42}
              colors={[
                alpha(palette.halo, 0.75 * veil + 0.1),
                alpha(palette.halo, 0.32 * veil + 0.05),
                alpha(palette.halo, 0),
              ]}
              positions={[0, 0.12, 1]}
            />
          </Rect>
          {/* No sun or moon disc in a band: it would sit behind header text. */}
          {veil > 0.25 && !clipHeight ? (
            <Circle
              cx={cx}
              cy={cy}
              r={Math.max(14, W * 0.018)}
              color={alpha(L.sunDisc, Math.min(1, veil + 0.1))}
            />
          ) : null}
        </Group>
      ) : (
        <Group>
          <Circle cx={cx} cy={cy} r={moonR * 9}>
            <RadialGradient
              c={vec(cx, cy)}
              r={moonR * 9}
              colors={[alpha(L.moonGlow, 0.28 * veil + 0.04), alpha(L.moonGlow, 0)]}
            />
          </Circle>
          {veil > 0.3 && !clipHeight ? (
            <Group
              clip={{
                rect: { x: cx - moonR, y: cy - moonR, width: moonR * 2, height: moonR * 2 },
                rx: moonR,
                ry: moonR,
              }}
            >
              <Circle cx={cx} cy={cy} r={moonR} color={alpha(L.moonDisc, veil)} />
              {/* The shadow disc covers the moon at new moon and slides off by the poya full moon. */}
              <Circle
                cx={cx + moonShift}
                cy={cy}
                r={moonR * 1.04}
                color={alpha(palette.top, 0.93)}
              />
            </Group>
          ) : null}
        </Group>
      )}

      {sunLow > 0 ? (
        <Rect x={0} y={hy - H * 0.22} width={W} height={H * 0.22}>
          <LinearGradient
            start={vec(0, hy - H * 0.22)}
            end={vec(0, hy)}
            colors={[
              alpha(glow, 0),
              alpha(mixHex(L.sunLow, glow, 0.3), 0.35 * sunLow * veil + 0.05),
            ]}
          />
        </Rect>
      ) : null}

      {ls.clouds.map((cl, i) => (
        <Oval
          key={`c${i}`}
          x={cl.cx - cl.rx}
          y={cl.cy - cl.ry}
          width={cl.rx * 2}
          height={cl.ry * 2}
        >
          <RadialGradient
            c={vec(cl.cx, cl.cy)}
            r={cl.rx}
            colors={[
              alpha(cloudColour, i < 6 + wx.cloud * 24 ? cloudAlpha : 0),
              alpha(cloudColour, 0),
            ]}
          />
        </Oval>
      ))}

      {ls.hills.map((hill, i) => (
        <Path key={`h${i}`} path={hill.d}>
          <LinearGradient
            start={vec(0, hill.top)}
            end={vec(0, hy)}
            colors={c.hills[i] ?? [palette.hillFar, palette.horizon]}
          />
        </Path>
      ))}
      <Path path={ls.shore} color={c.shore} />

      <Rect x={0} y={ls.waterTop} width={W} height={ls.waterBottom - ls.waterTop}>
        <LinearGradient
          start={vec(0, ls.waterTop)}
          end={vec(0, ls.waterBottom)}
          colors={[...c.waterStops]}
          positions={[0, 0.55, 1]}
        />
      </Rect>
      <Path path={ls.shoreReflection} color={alpha(c.shore, 0.35)} />
      {(day ? veil > 0.2 : veil > 0.35)
        ? Array.from({ length: 18 }, (_, i) => {
            const y = ls.waterTop + (i / 18) * (ls.waterBottom - ls.waterTop);
            const w = (14 + ((i * 37) % 23)) * (1 + i / 9);
            return (
              <Rect
                key={`g${i}`}
                x={cx - w / 2}
                y={y}
                width={w}
                height={1.4}
                color={alpha(c.glint, (0.5 - i / 44) * veil)}
              />
            );
          })
        : null}
      {ls.glints.map((g, i) => (
        <Rect
          key={`w${i}`}
          x={g.x}
          y={g.y}
          width={g.w}
          height={1}
          color={alpha(L.white, g.a * (0.3 + light))}
        />
      ))}
      <Path path={ls.lotusPads} color={c.lotus} />
      {light > 0.3
        ? ls.lotusFlowers.map((f, i) => (
            <Oval
              key={`l${i}`}
              x={f.cx - f.rx}
              y={f.cy - f.ry}
              width={f.rx * 2}
              height={f.ry * 2}
              color={alpha(c.lotusFlower, 0.9)}
            />
          ))
        : null}

      <Rect
        x={0}
        y={ls.waterBottom - 2}
        width={W}
        height={H - ls.waterBottom + 2}
        color={c.paddyBase}
      />
      {ls.terraces.map((d, i) => (
        <Path key={`t${i}`} path={d} color={c.terraces[i] ?? c.paddyBase} />
      ))}
      {ls.bunds.map((b, i) => (
        <Path
          key={`b${i}`}
          path={b.d}
          style="stroke"
          strokeWidth={b.width}
          color={alpha(c.bund, 0.55)}
        />
      ))}
      {scene.tier === 'rich' && ls.stalks ? (
        <Path
          path={ls.stalks}
          style="stroke"
          strokeWidth={1}
          color={alpha(c.stalk, 0.25 + light * 0.2)}
        />
      ) : null}

      {ls.palms.map((p, i) => (
        <Group key={`p${i}`}>
          <Path
            path={p.trunk}
            style="stroke"
            strokeWidth={p.trunkWidth}
            strokeCap="round"
            color={c.silhouette}
          />
          <Path
            path={p.fronds}
            style="stroke"
            strokeWidth={p.frondWidth}
            strokeCap="round"
            color={c.silhouette}
          />
          <Path path={p.leaflets} style="stroke" strokeWidth={1} color={c.silhouette} />
          <Circle cx={p.crown.cx} cy={p.crown.cy} r={p.crown.r} color={c.silhouette} />
        </Group>
      ))}
      {ls.kumbuk ? (
        <Group>
          <Path path={ls.kumbuk.trunk} color={c.silhouette} />
          {ls.kumbuk.crowns.map((e, i) => (
            <Oval
              key={`k${i}`}
              x={e.cx - e.rx}
              y={e.cy - e.ry}
              width={e.rx * 2}
              height={e.ry * 2}
              color={c.silhouette}
            />
          ))}
        </Group>
      ) : null}

      {wx.mist ? (
        <Rect x={0} y={H * 0.5} width={W} height={H * 0.35}>
          <LinearGradient
            start={vec(0, H * 0.5)}
            end={vec(0, H * 0.85)}
            colors={[
              alpha(L.mist, 0),
              alpha(mixHex(L.mist, palette.horizon, 0.3), 0.22 + light * 0.12),
              alpha(L.mist, 0),
            ]}
          />
        </Rect>
      ) : null}
      {wx.rain > 0 ? (
        <Rect
          x={0}
          y={0}
          width={W}
          height={H}
          color={alpha(mixHex(palette.horizon, L.rainVeil, 0.5), 0.06 + wx.dim * 0.1)}
        />
      ) : null}
    </Group>
  );
}
