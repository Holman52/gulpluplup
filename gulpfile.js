import gulp from 'gulp';
import fileInclude from 'gulp-file-include';
import { deleteAsync } from 'del';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import htmlmin from 'gulp-htmlmin';
import browserSync from 'browser-sync';
import webp from 'gulp-webp';
import responsive from 'gulp-sharp-responsive';
import newer from "gulp-newer";
import terser from 'gulp-terser'; // Добавляем минификатор JS

const sass = gulpSass(dartSass);
const bs = browserSync.create();

const paths = {
  html: {
    src: 'src/pages/**/*.html',
    dest: 'dist/',
    watch: ['src/pages/**/*.html', 'src/components/**/*.html'],
  },
  styles: {
    src: 'src/scss/*.scss',
    dest: 'dist/assets/css/',
    watch: 'src/scss/**/*.scss',
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/assets/js/',
    watch: 'src/js/**/*.js',
  },
  assets: {
    src: 'src/assets/**/*{.svg}',
    img: 'src/assets/**/*{.jpeg,.jpg,.png}',
    dest: 'dist/assets/',
  },
  images: {
    src: 'src/images/**/*{.jpeg,.jpg,.png}',
    dest: 'dist/assets/images',
  }
};

// Обработка JavaScript
export const scripts = () =>
  gulp.src(paths.scripts.src)
    .pipe(terser()) // Минификация JS
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(bs.stream());

export const html = () =>
  gulp
    .src(paths.html.src)
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: 'src/components/',
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: false,
        removeComments: true,
      })
    )
    .pipe(gulp.dest(paths.html.dest))
    .pipe(bs.stream());

function fonts() {
  return gulp.src('src/fonts/**/*.{woff,woff2}')
    .pipe(gulp.dest('dist/fonts/'));
}

export const styles = () =>
  gulp
    .src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(bs.stream());

const imagesToWebp = () =>
  gulp.src(paths.images.src, { encoding: false })
    .pipe(newer(paths.images.dest))
    .pipe(webp({ quality: 80 }))
    .pipe(gulp.dest(paths.images.dest))
  gulp.src(paths.assets.img, { encoding: false })
    .pipe(newer(paths.assets.dest))
    .pipe(webp({ quality: 80 }))
    .pipe(gulp.dest(paths.assets.dest))

const imagesToMobileWebp = () =>
  gulp.src(paths.images.src, { encoding: false })
    .pipe(responsive({
      formats: [
        { width: 300, rename: { suffix: "-vm" }, format: 'webp' },
        { width: 400, rename: { suffix: "-sm" }, format: 'webp' },
        { width: 1024, rename: { suffix: "-lg" }, format: 'webp' },
      ]
    }))
    .pipe(gulp.dest(paths.images.dest));

// Копирование ассетов
export const assets = () =>
  gulp.src(paths.assets.src, {encoding:false}).pipe(gulp.dest(paths.assets.dest));

// Очистка
export const clean = () => deleteAsync(['dist']);

// Сервер
export const serve = () => {
  bs.init({
    server: {
      baseDir: './dist',
    },
    notify: false,
    open: true,
    cors: true,
  });

  gulp.watch(paths.styles.watch, styles);
  gulp.watch(paths.scripts.watch, scripts); // Добавляем вотчер для JS
  gulp.watch(paths.html.watch, html);
  gulp.watch(paths.assets.src, assets);
  gulp.watch(paths.images.src, imagesToWebp);
  gulp.watch(paths.images.src, imagesToMobileWebp);
};

// Обновляем сборку, добавляя обработку JS
export const build = gulp.series(
  clean, 
  gulp.parallel(
    styles, 
    html, 
    fonts, 
    assets, 
    imagesToWebp, 
    imagesToMobileWebp,
    scripts // Добавляем задачу для JS
  )
);

export default gulp.series(build, serve);