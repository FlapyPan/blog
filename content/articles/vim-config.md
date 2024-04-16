---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-08-14T00:00:00.000Z
update: 2023-08-14T00:00:00.000Z
---

# vim 配置文件

```vim
set nocompatible
syntax on
set showmode
set showcmd
set mouse=a
set encoding=utf-8
set t_Co=256
filetype indent on
set autoindent
set expandtab
set tabstop=4
set shiftwidth=4
set softtabstop=4
set smartindent
filetype plugin indent on

set number
"set relativenumber
"set cursorline
set nowrap
"set textwidth=80
"set wrap
"set linebreak
"set wrapmargin=2
set scrolloff=3
set sidescrolloff=10
set laststatus=2
set ruler

set showmatch
set hlsearch
set incsearch
set ignorecase
set smartcase

set undofile
set undodir=~/.vim/.undo//

set autochdir
set noerrorbells
"set visualbell
set history=1000
set autoread
set listchars=tab:»\ ,trail:·
set list
set wildmenu
set wildmode=longest:list,full
```