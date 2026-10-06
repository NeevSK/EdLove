# Developer Certificate of Origin (DCO) v1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or

(b) The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or

(c) The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.

(d) I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.

---

## Sign-off Procedure

All commits must include a `Signed-off-by` line with your legal name and email address matching your GitHub account. Use `git commit -s` to add this automatically.

**Example:**
```
git commit -s -m "Fix typo in README"
```

This produces a commit message like:
```
Fix typo in README

Signed-off-by: Jane Developer <jane@example.com>
```

## Verification

CI will verify that all commits in a PR have valid DCO sign-offs. Commits without sign-offs will fail the `dco` check.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

By signing off your contribution, you agree that it is licensed under the MIT License.