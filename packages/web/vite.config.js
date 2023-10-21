import { viteStaticCopy } from 'vite-plugin-static-copy'

/** @type { import("vite").UserConfig} */
export default {
  base: './',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'lib',
          dest: ''
        }
      ]
    })
  ],
}