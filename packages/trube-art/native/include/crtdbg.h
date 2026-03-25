#pragma once

// Dummy crtdbg.h to satisfy clangd on Windows
#ifndef _INC_CRTDBG
#define _INC_CRTDBG

#define _ASSERTE(expr) ((void)0)
#define _ASSERT(expr) ((void)0)

#endif // _INC_CRTDBG
