#!/usr/bin/env bash
# Turns raw downloads in assets-src/ into web-ready files in public/assets/.
# Requires: ffmpeg, cwebp (brew install ffmpeg webp). Idempotent; re-run any time.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=assets-src
DL=$SRC/downloads
OUT=public/assets
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p $OUT/{img,seq/hands,mask,video,audio}

ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }
webp() { cwebp -quiet -q "${3:-78}" -alpha_q 90 "$1" -o "$2"; }

# H.264 overlay clip: in, out, filter, [start], [duration]
clip() {
  ff -ss "${4:-0}" -t "${5:-8}" -i "$1" -an -vf "$3,format=yuv420p" \
     -c:v libx264 -preset slow -crf 30 -movflags +faststart -profile:v main "$2"
}

echo "• images"
# Roundels for "The Day" — crops of public-domain Mewar/Rajput miniatures
ff -i $DL/miniatures/baraat.jpg   -vf "crop=733:733:697:37,scale=720:720"   $TMP/r1.png
ff -i $DL/miniatures/varmala.jpg  -vf "crop=860:860:930:560,scale=720:720"  $TMP/r2.png
ff -i $DL/miniatures/pheras.jpg   -vf "crop=1000:1000:925:500,scale=720:720" $TMP/r3.png
ff -i $DL/miniatures/jagniwas.jpg -vf "crop=958:958:860:600,scale=720:720"  $TMP/r4.png
webp $TMP/r1.png $OUT/img/roundel-baraat.webp
webp $TMP/r2.png $OUT/img/roundel-varmala.webp
webp $TMP/r3.png $OUT/img/roundel-pheras.webp
webp $TMP/r4.png $OUT/img/roundel-dinner.webp

# Full Jag Niwas painting — Save-the-Date palace layer (cropped to the palace block)
ff -i $DL/miniatures/jagniwas.jpg -vf "crop=1100:900:680:110,scale=900:-2" $TMP/palace.png
webp $TMP/palace.png $OUT/img/jagniwas-palace.webp 74

# Venue: colour painting + a sepia pencil-sketch version of the same painting
ff -i $SRC/provided/lake-palace.png -vf "scale=1080:-2" $TMP/lake.png
webp $TMP/lake.png $OUT/img/lake-palace.webp 80
ff -i $TMP/lake.png -filter_complex "\
  [0]format=gray,hqdn3d=8:6,split[a][b];[b]negate,gblur=sigma=5[c];\
  [a][c]blend=all_mode=dodge,format=gray,format=rgb24,\
  curves=all='0/0 0.5/0.36 0.8/1 1/1',lutrgb=r='255-(255-val)*0.78':g='255-(255-val)*0.9':b='255-(255-val)*1.0'" $TMP/lake-ink.png
webp $TMP/lake-ink.png $OUT/img/lake-palace-ink.webp 78
# A single boat lifted from the painting (ivory background → used with multiply)
ff -i $SRC/provided/lake-palace.png -vf "crop=164:84:858:1153,scale=328:-2" $TMP/boat.png
webp $TMP/boat.png $OUT/img/boat.webp 82

# Textures: watercolour paper grain + canvas weave, normalised for multiply blending
# (source has a damaged strip on its right edge: crop it away, mirror-tile to stay seamless)
ff -i $DL/textures/Paper001/Paper001_1K-JPG_Color.jpg -filter_complex "\
  [0]format=gray,crop=600:600:0:0,scale=430:430,split[a][b];[b]gblur=sigma=10[c];\
  [a][c]blend=all_expr='clip((A-B)*2.2+222,190,255)',split[l][r];[r]hflip[rf];[l][rf]hstack,split[t][u];[u]vflip[uf];[t][uf]vstack" $TMP/grain.png
webp $TMP/grain.png $OUT/img/paper-grain.webp 72
ff -i $DL/textures/Fabric030/Fabric030_1K-JPG_Color.jpg \
   -vf "format=gray,scale=512:512,normalize=blackpt=0x9a9a9a:whitept=white" $TMP/canvas.png
webp $TMP/canvas.png $OUT/img/canvas-weave.webp 70

echo "• hands frame sequence"
# One full cycle of the alta animation (plain palms → alta → dots linking palms)
rm -f $OUT/seq/hands/*.webp
ff -ss 7.3 -t 7.3 -i $SRC/provided/alta-hands.mp4 -vf "fps=12,scale=540:960" $TMP/h_%03d.png
n=0
for f in $TMP/h_*.png; do
  n=$((n+1)); webp "$f" "$(printf "$OUT/seq/hands/%03d.webp" $n)" 70
done
echo "  $n frames"

echo "• ink masks (sprite sheets, alpha = ink)"
# mask_sprite <name> <frames-png-glob> <cols> <rows>
mask_sprite() {
  ff -framerate 1 -i "$2" -vf "tile=$3x$4" -frames:v 1 $TMP/$1-sheet.png
  cwebp -quiet -q 80 -alpha_q 85 $TMP/$1-sheet.png -o $OUT/mask/$1.webp
}
# Round blot growing from centre — 24 frames, 320px squares
ff -ss 0.25 -t 2.4 -i $DL/clips/ink-blot.mp4 -filter_complex "\
  [0]fps=10,crop=1080:1080:420:0,scale=320:320,format=gray,negate,curves=all='0/0 0.25/0 0.6/1 1/1'[a];\
  color=white:s=320x320:r=10[w];[w][a]alphamerge,format=rgba" -frames:v 24 $TMP/blot_%02d.png
mask_sprite ink-blot "$TMP/blot_%02d.png" 6 4
# Portrait ink flood covering the screen (green-screen keyed) — 24 frames, 270x480
ff -ss 0 -t 7.4 -i $DL/clips/ink-cover-portrait-green.mp4 -filter_complex "\
  [0]fps=3.25,scale=270:480,format=gbrp,extractplanes=g,negate,curves=all='0/0 0.45/0 0.7/1 1/1',split[m][n];\
  [n]hflip,vflip[f];[m][f]blend=all_mode=lighten[a];\
  color=white:s=270x480:r=3.25[w];[w][a]alphamerge,format=rgba" -frames:v 24 $TMP/cover_%02d.png
mask_sprite ink-cover "$TMP/cover_%02d.png" 6 4

echo "• overlay videos"
# screen-blend clips (black = transparent)
clip $DL/clips/gold-glitter.mp4 $OUT/video/gold-dust.mp4   "crop=405:720:437:0,scale=540:960,curves=all='0/0 0.3/0 0.7/0.75 1/1',eq=saturation=0.9" 2 7
clip $DL/clips/fireworks.mp4    $OUT/video/fireworks.mp4   "crop=405:720:437:0,scale=540:960" 0 10
clip $DL/clips/sparks.mp4       $OUT/video/sparks.mp4      "crop=608:1080:656:0,scale=540:960" 2 6
clip $DL/clips/mist.mp4         $OUT/video/mist.mp4        "scale=960:540,eq=brightness=-0.15:contrast=1.3" 0 8
clip $DL/clips/candle-static.mp4 $OUT/video/flame.mp4      "crop=200:300:553:170,scale=200:300,curves=all='0/0 0.25/0 1/1'" 2 8
# multiply-blend clips (white = transparent)
clip $DL/clips/ink-red-bleed.mp4 $OUT/video/alta-bleed.mp4 "crop=608:1080:656:0,scale=540:960,curves=all='0/0 0.75/0.8 0.86/1 1/1'" 0 6
clip $DL/clips/birds.mp4        $OUT/video/birds.mp4       "format=gray,crop=iw:ih*0.62:0:0,curves=all='0/0 0.45/0.25 0.62/1 1/1',scale=960:-2,format=yuv420p" 4 10

echo "• audio"
ff -i $DL/music/m21.mp3 -af "afade=t=in:d=2,afade=t=out:st=160:d=8" -ac 2 -b:a 112k $OUT/audio/music.mp3

echo "done →"
du -sh $OUT/* | sort -h
du -sh $OUT
