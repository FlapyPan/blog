/* This is a script to create a new post markdown file with front-matter */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function getDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(
    `Error: No filename argument provided\nUsage: new-post <filename>`
  )
  process.exit(1)
}

const title = args[0]
const description = args[1]
const pathTitle = title.toLocaleLowerCase().replace(/\s+/g, '-')
const targetDir = `./src/content/posts/${pathTitle}`
const fullPath = path.join(targetDir, `index.md`)

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

if (fs.existsSync(fullPath)) {
  console.error(`Error：File ${fullPath} already exists `)
  process.exit(1)
}

const content = `---
title: ${title}
published: ${getDate()}
description: ${description ?? `''`}
image: ''
tags: []
category: ''
---
`

fs.writeFileSync(fullPath, content)

console.log(`Post ${targetDir} created`)
