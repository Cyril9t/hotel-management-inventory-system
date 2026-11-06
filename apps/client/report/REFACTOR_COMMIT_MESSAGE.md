Recommended commit message:

```text
refactor(client): split universal context into focused modules

Extract shared API, auth, theme, rooms, and shift responsibilities from
the universal context. Scope feature providers to routes that consume them
and preserve session and shift navigation behavior.
```
