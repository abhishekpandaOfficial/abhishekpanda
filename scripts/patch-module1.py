#!/usr/bin/env python3
"""Patch Module 1 (C# & .NET) in both dotnet-mastery-toc.html files with exact curriculum subtopics."""

import re

NEW_MODULE1 = '''    <!-- ══════ MODULE 1: C# MASTERY ══════ -->
    <div class="module-card open" id="module-1">
      <div class="module-top-strip" style="background:linear-gradient(90deg,#00d4ff,#0088aa)"></div>
      <div class="module-header" onclick="toggleModule(this)">
        <div class="module-icon-wrap mod-csharp">
          <svg width="22" height="22" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" aria-label="C#" style="flex-shrink:0"><path fill="#9B4F96" d="M115.4 30.7 67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7z"/><path fill="#68217A" d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z"/><path fill="#fff" d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6zM97 66.2l.9-4.3h-4.2v-4.7h5.1L100 51h4.9l-1.2 6.1h3.8l1.2-6.1h4.8l-1.2 6.1h2.4v4.7h-3.3l-.9 4.3h3.3v4.7h-4.2L109 82h-4.9l1.2-6.1h-3.8L100.1 82h-4.8l1.2-6.1h-2.4v-4.7H97zm4.8 0h3.8l.9-4.3h-3.8l-.9 4.3z"/></svg>
        </div>
        <div class="module-num">Series 01 · C# Mastery</div>
        <h3 class="module-title">C# &amp; .NET Runtime Engineering</h3>
        <div class="module-meta">
          <span class="meta-chip">34 Chapters</span>
          <span class="meta-chip">11 Parts</span>
          <span class="meta-chip">Basic → Architect</span>
        </div>
        <div class="tech-logos">
          <span class="tech-chip">
            <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" aria-label="C#" style="flex-shrink:0"><path fill="#9B4F96" d="M115.4 30.7 67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7z"/><path fill="#68217A" d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z"/><path fill="#fff" d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6zM97 66.2l.9-4.3h-4.2v-4.7h5.1L100 51h4.9l-1.2 6.1h3.8l1.2-6.1h4.8l-1.2 6.1h2.4v4.7h-3.3l-.9 4.3h3.3v4.7h-4.2L109 82h-4.9l1.2-6.1h-3.8L100.1 82h-4.8l1.2-6.1h-2.4v-4.7H97zm4.8 0h3.8l.9-4.3h-3.8l-.9 4.3z"/></svg>
            C#
          </span>
          <span class="tech-chip">.NET Runtime</span>
          <span class="tech-chip">Async/Await</span>
          <span class="tech-chip">GC &amp; Memory</span>
        </div>
        <span class="module-arrow">▾</span>
      </div>
      <div class="module-parts">
        <!-- PART I -->
        <div class="part-section open">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(96,165,250,0.12);color:var(--accent)">I</div>
            <span class="part-name">The .NET Runtime &amp; Execution Model</span>
            <span class="part-count">4 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.1</span>
              <div class="chapter-info">
                <div class="chapter-title">Evolution of .NET &amp; Runtime Architecture</div>
                <div class="chapter-subs">
                  <div class="sub-item">1.1 From .NET Framework to Modern .NET</div>
                  <div class="sub-item">1.2 Cross-platform runtime architecture</div>
                  <div class="sub-item">1.3 SDK-style projects &amp; build pipeline</div>
                  <div class="sub-item">1.4 The role of the CLR</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.2</span>
              <div class="chapter-info">
                <div class="chapter-title">The Common Language Runtime (CLR)</div>
                <div class="chapter-subs">
                  <div class="sub-item">2.1 Managed execution pipeline</div>
                  <div class="sub-item">2.2 Memory management responsibilities</div>
                  <div class="sub-item">2.3 Security &amp; verification</div>
                  <div class="sub-item">2.4 Thread management</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.3</span>
              <div class="chapter-info">
                <div class="chapter-title">Compilation &amp; Execution Pipeline</div>
                <div class="chapter-subs">
                  <div class="sub-item">3.1 C# → IL (Intermediate Language)</div>
                  <div class="sub-item">3.2 IL → Native via JIT</div>
                  <div class="sub-item">3.3 Tiered compilation</div>
                  <div class="sub-item">3.4 ReadyToRun</div>
                  <div class="sub-item">3.5 Native AOT</div>
                  <div class="sub-item">3.6 What happens when you run a C# program</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.4</span>
              <div class="chapter-info">
                <div class="chapter-title">Assemblies, Metadata &amp; Type System</div>
                <div class="chapter-subs">
                  <div class="sub-item">4.1 PE file structure</div>
                  <div class="sub-item">4.2 Manifest &amp; metadata tables</div>
                  <div class="sub-item">4.3 CTS &amp; CLS</div>
                  <div class="sub-item">4.4 Assembly loading &amp; versioning</div>
                  <div class="sub-item">4.5 Application isolation (AppDomains → AssemblyLoadContext)</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART II -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(0,229,160,0.12);color:var(--green)">II</div>
            <span class="part-name">Core Language &amp; Type System</span>
            <span class="part-count">4 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.5</span>
              <div class="chapter-info">
                <div class="chapter-title">Variables, Memory &amp; Value Semantics</div>
                <div class="chapter-subs">
                  <div class="sub-item">5.1 Value types vs reference types</div>
                  <div class="sub-item">5.2 Stack vs heap internals</div>
                  <div class="sub-item">5.3 Default values</div>
                  <div class="sub-item">5.4 Nullable value types</div>
                  <div class="sub-item">5.5 Nullable reference types</div>
                </div>
              </div>
              <span class="chapter-level ch-basic">Basic</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.6</span>
              <div class="chapter-info">
                <div class="chapter-title">Structs, Classes &amp; Records</div>
                <div class="chapter-subs">
                  <div class="sub-item">6.1 Struct design guidelines</div>
                  <div class="sub-item">6.2 record &amp; record struct</div>
                  <div class="sub-item">6.3 Immutability</div>
                  <div class="sub-item">6.4 ref struct</div>
                  <div class="sub-item">6.5 Inline arrays (modern feature)</div>
                  <div class="sub-item sub-note">⬡ Architect Matrix: Struct vs Class</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.7</span>
              <div class="chapter-info">
                <div class="chapter-title">Parameters &amp; Memory Passing</div>
                <div class="chapter-subs">
                  <div class="sub-item">7.1 ref / out / in</div>
                  <div class="sub-item">7.2 ref returns</div>
                  <div class="sub-item">7.3 scoped keyword</div>
                  <div class="sub-item">7.4 Defensive copying</div>
                  <div class="sub-item">7.5 Performance tradeoffs</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.8</span>
              <div class="chapter-info">
                <div class="chapter-title">Generics Deep Dive</div>
                <div class="chapter-subs">
                  <div class="sub-item">8.1 Generic constraints</div>
                  <div class="sub-item">8.2 Covariance &amp; contravariance</div>
                  <div class="sub-item">8.3 unmanaged constraint</div>
                  <div class="sub-item">8.4 notnull constraint</div>
                  <div class="sub-item">8.5 Static abstract members in interfaces</div>
                  <div class="sub-item">8.6 Generic math</div>
                  <div class="sub-item">8.7 CLR generic code sharing model</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART III -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(96,165,250,0.12);color:var(--blue)">III</div>
            <span class="part-name">Object Orientation &amp; Design</span>
            <span class="part-count">4 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.9</span>
              <div class="chapter-info">
                <div class="chapter-title">Encapsulation &amp; Immutability</div>
                <div class="chapter-subs">
                  <div class="sub-item">9.1 Access modifiers</div>
                  <div class="sub-item">9.2 init-only properties</div>
                  <div class="sub-item">9.3 Required members</div>
                  <div class="sub-item">9.4 Immutable object patterns</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.10</span>
              <div class="chapter-info">
                <div class="chapter-title">Inheritance vs Composition</div>
                <div class="chapter-subs">
                  <div class="sub-item">10.1 Liskov Substitution Principle</div>
                  <div class="sub-item">10.2 Fragile base class problem</div>
                  <div class="sub-item">10.3 Sealed types</div>
                  <div class="sub-item">10.4 Default interface methods</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.11</span>
              <div class="chapter-info">
                <div class="chapter-title">Polymorphism &amp; Dispatch Internals</div>
                <div class="chapter-subs">
                  <div class="sub-item">11.1 virtual / override mechanics</div>
                  <div class="sub-item">11.2 vtable internals</div>
                  <div class="sub-item">11.3 Interface dispatch cost</div>
                  <div class="sub-item">11.4 Method hiding</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.12</span>
              <div class="chapter-info">
                <div class="chapter-title">Equality &amp; Identity</div>
                <div class="chapter-subs">
                  <div class="sub-item">12.1 Reference equality</div>
                  <div class="sub-item">12.2 Structural equality</div>
                  <div class="sub-item">12.3 IEquatable&lt;T&gt;</div>
                  <div class="sub-item">12.4 Hash code design</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART IV -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(180,127,255,0.12);color:var(--purple)">IV</div>
            <span class="part-name">Delegates, Events &amp; Functional C#</span>
            <span class="part-count">3 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.13</span>
              <div class="chapter-info">
                <div class="chapter-title">Delegates Internals</div>
                <div class="chapter-subs">
                  <div class="sub-item">13.1 Delegate IL representation</div>
                  <div class="sub-item">13.2 Multicast delegates</div>
                  <div class="sub-item">13.3 Invocation list mechanics</div>
                  <div class="sub-item">13.4 Func&lt;&gt; vs Action&lt;&gt;</div>
                  <div class="sub-item">13.5 Delegate caching &amp; performance</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.14</span>
              <div class="chapter-info">
                <div class="chapter-title">Events &amp; Observer Patterns</div>
                <div class="chapter-subs">
                  <div class="sub-item">14.1 event keyword vs delegate field</div>
                  <div class="sub-item">14.2 Memory leaks via events</div>
                  <div class="sub-item">14.3 Weak events</div>
                  <div class="sub-item">14.4 Thread-safe event invocation</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.15</span>
              <div class="chapter-info">
                <div class="chapter-title">Lambdas &amp; Closures</div>
                <div class="chapter-subs">
                  <div class="sub-item">15.1 Closure capture mechanics</div>
                  <div class="sub-item">15.2 Compiler-generated classes</div>
                  <div class="sub-item">15.3 Allocation pitfalls</div>
                  <div class="sub-item">15.4 Functional composition</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART V -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(0,229,160,0.12);color:var(--green)">V</div>
            <span class="part-name">Collections &amp; LINQ Engineering</span>
            <span class="part-count">2 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.16</span>
              <div class="chapter-info">
                <div class="chapter-title">Collection Internals</div>
                <div class="chapter-subs">
                  <div class="sub-item">16.1 List&lt;T&gt; resizing</div>
                  <div class="sub-item">16.2 Dictionary hashing</div>
                  <div class="sub-item">16.3 Hash collisions</div>
                  <div class="sub-item">16.4 HashSet uniqueness</div>
                  <div class="sub-item">16.5 SortedDictionary tradeoffs</div>
                  <div class="sub-item">16.6 Immutable collections</div>
                  <div class="sub-item">16.7 Concurrent collections</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.17</span>
              <div class="chapter-info">
                <div class="chapter-title">LINQ Internals</div>
                <div class="chapter-subs">
                  <div class="sub-item">17.1 IEnumerable vs IQueryable</div>
                  <div class="sub-item">17.2 Deferred execution</div>
                  <div class="sub-item">17.3 Iterator state machines</div>
                  <div class="sub-item">17.4 Expression tree translation</div>
                  <div class="sub-item">17.5 Big-O of LINQ chains</div>
                  <div class="sub-item">17.6 Writing custom LINQ provider</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART VI -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(255,107,107,0.12);color:var(--red)">VI</div>
            <span class="part-name">Error Handling &amp; Diagnostics</span>
            <span class="part-count">2 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.18</span>
              <div class="chapter-info">
                <div class="chapter-title">Exception Engineering</div>
                <div class="chapter-subs">
                  <div class="sub-item">18.1 Exception hierarchy design</div>
                  <div class="sub-item">18.2 Stack trace preservation</div>
                  <div class="sub-item">18.3 Rethrowing correctly</div>
                  <div class="sub-item">18.4 Fail-fast philosophy</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.19</span>
              <div class="chapter-info">
                <div class="chapter-title">Logging &amp; Diagnostics</div>
                <div class="chapter-subs">
                  <div class="sub-item">19.1 Structured logging</div>
                  <div class="sub-item">19.2 Correlation IDs</div>
                  <div class="sub-item">19.3 Performance tradeoffs</div>
                  <div class="sub-item">19.4 Designing log-friendly APIs</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART VII -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(96,165,250,0.12);color:var(--blue)">VII</div>
            <span class="part-name">Threading &amp; Async Engineering</span>
            <span class="part-count">5 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.20</span>
              <div class="chapter-info">
                <div class="chapter-title">Threads &amp; ThreadPool</div>
                <div class="chapter-subs">
                  <div class="sub-item">20.1 Thread lifecycle</div>
                  <div class="sub-item">20.2 ThreadPool internals</div>
                  <div class="sub-item">20.3 Work-stealing algorithm</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.21</span>
              <div class="chapter-info">
                <div class="chapter-title">Task &amp; TPL Internals</div>
                <div class="chapter-subs">
                  <div class="sub-item">21.1 Task lifecycle states</div>
                  <div class="sub-item">21.2 Continuation scheduling</div>
                  <div class="sub-item">21.3 TaskCompletionSource</div>
                  <div class="sub-item">21.4 ValueTask tradeoffs</div>
                  <div class="sub-item">21.5 ExecutionContext &amp; AsyncLocal</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.22</span>
              <div class="chapter-info">
                <div class="chapter-title">async/await Internals</div>
                <div class="chapter-subs">
                  <div class="sub-item">22.1 Compiler-generated state machines</div>
                  <div class="sub-item">22.2 SynchronizationContext</div>
                  <div class="sub-item">22.3 ConfigureAwait</div>
                  <div class="sub-item">22.4 Deadlock case studies</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.23</span>
              <div class="chapter-info">
                <div class="chapter-title">Synchronization Primitives</div>
                <div class="chapter-subs">
                  <div class="sub-item">23.1 lock vs Monitor</div>
                  <div class="sub-item">23.2 Mutex</div>
                  <div class="sub-item">23.3 SemaphoreSlim</div>
                  <div class="sub-item">23.4 ReaderWriterLockSlim</div>
                  <div class="sub-item">23.5 SpinLock</div>
                  <div class="sub-item">23.6 Interlocked</div>
                </div>
              </div>
              <span class="chapter-level ch-arch">Architect</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.24</span>
              <div class="chapter-info">
                <div class="chapter-title">Memory Model &amp; Concurrency</div>
                <div class="chapter-subs">
                  <div class="sub-item">24.1 volatile keyword</div>
                  <div class="sub-item">24.2 Memory barriers</div>
                  <div class="sub-item">24.3 Happens-before relationship</div>
                  <div class="sub-item">24.4 Instruction reordering</div>
                  <div class="sub-item">24.5 False sharing</div>
                  <div class="sub-item">24.6 Lock-free design basics</div>
                </div>
              </div>
              <span class="chapter-level ch-arch">Architect</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART VIII -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(255,170,68,0.12);color:var(--orange)">VIII</div>
            <span class="part-name">Memory &amp; Garbage Collection</span>
            <span class="part-count">4 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.25</span>
              <div class="chapter-info">
                <div class="chapter-title">GC Architecture</div>
                <div class="chapter-subs">
                  <div class="sub-item">25.1 Generational GC</div>
                  <div class="sub-item">25.2 LOH</div>
                  <div class="sub-item">25.3 Server vs Workstation GC</div>
                  <div class="sub-item">25.4 Background GC</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.26</span>
              <div class="chapter-info">
                <div class="chapter-title">Resource Management</div>
                <div class="chapter-subs">
                  <div class="sub-item">26.1 IDisposable pattern</div>
                  <div class="sub-item">26.2 Finalizers</div>
                  <div class="sub-item">26.3 using &amp; await using</div>
                </div>
              </div>
              <span class="chapter-level ch-inter">Intermediate</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.27</span>
              <div class="chapter-info">
                <div class="chapter-title">High-Performance Memory APIs</div>
                <div class="chapter-subs">
                  <div class="sub-item">27.1 Span&lt;T&gt;</div>
                  <div class="sub-item">27.2 Memory&lt;T&gt;</div>
                  <div class="sub-item">27.3 stackalloc</div>
                  <div class="sub-item">27.4 ArrayPool</div>
                  <div class="sub-item">27.5 Object pooling</div>
                  <div class="sub-item">27.6 Zero-allocation patterns</div>
                </div>
              </div>
              <span class="chapter-level ch-arch">Architect</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.28</span>
              <div class="chapter-info">
                <div class="chapter-title">Unsafe &amp; Low-Level Memory</div>
                <div class="chapter-subs">
                  <div class="sub-item">28.1 unsafe keyword</div>
                  <div class="sub-item">28.2 Pointers</div>
                  <div class="sub-item">28.3 fixed statement</div>
                  <div class="sub-item">28.4 MemoryMarshal</div>
                  <div class="sub-item">28.5 Native memory interop</div>
                </div>
              </div>
              <span class="chapter-level ch-arch">Architect</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART IX -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(180,127,255,0.12);color:var(--purple)">IX</div>
            <span class="part-name">Metaprogramming &amp; Runtime Dynamics</span>
            <span class="part-count">4 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.29</span>
              <div class="chapter-info">
                <div class="chapter-title">Reflection Deep Dive</div>
                <div class="chapter-subs">
                  <div class="sub-item">29.1 Metadata inspection</div>
                  <div class="sub-item">29.2 Dynamic instantiation</div>
                  <div class="sub-item">29.3 Performance caching</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.30</span>
              <div class="chapter-info">
                <div class="chapter-title">Expression Trees</div>
                <div class="chapter-subs">
                  <div class="sub-item">30.1 Building expressions dynamically</div>
                  <div class="sub-item">30.2 Compiling expressions</div>
                  <div class="sub-item">30.3 ORM translation usage</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.31</span>
              <div class="chapter-info">
                <div class="chapter-title">Dynamic &amp; DLR</div>
                <div class="chapter-subs">
                  <div class="sub-item">31.1 Runtime binding</div>
                  <div class="sub-item">31.2 Dynamic invocation cost</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.32</span>
              <div class="chapter-info">
                <div class="chapter-title">Roslyn &amp; Source Generators</div>
                <div class="chapter-subs">
                  <div class="sub-item">32.1 Compiler pipeline</div>
                  <div class="sub-item">32.2 Writing analyzers</div>
                  <div class="sub-item">32.3 Compile-time code generation</div>
                </div>
              </div>
              <span class="chapter-level ch-arch">Architect</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART X -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(255,107,107,0.12);color:var(--red)">X</div>
            <span class="part-name">Performance Engineering</span>
            <span class="part-count">2 chapters</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.33</span>
              <div class="chapter-info">
                <div class="chapter-title">Benchmarking &amp; Profiling</div>
                <div class="chapter-subs">
                  <div class="sub-item">33.1 BenchmarkDotNet</div>
                  <div class="sub-item">33.2 CPU vs memory tradeoffs</div>
                  <div class="sub-item">33.3 Micro-optimization traps</div>
                </div>
              </div>
              <span class="chapter-level ch-arch">Architect</span>
              <span class="ch-expand">▾</span>
            </div>
            <div class="chapter-item" onclick="toggleChapter(this)">
              <span class="chapter-num">Ch.34</span>
              <div class="chapter-info">
                <div class="chapter-title">Algorithmic Thinking in C#</div>
                <div class="chapter-subs">
                  <div class="sub-item">34.1 Big-O analysis</div>
                  <div class="sub-item">34.2 Collection performance comparison</div>
                </div>
              </div>
              <span class="chapter-level ch-adv">Advanced</span>
              <span class="ch-expand">▾</span>
            </div>
          </div>
        </div>
        <!-- PART XI -->
        <div class="part-section">
          <div class="part-header" onclick="togglePart(this)">
            <div class="part-icon" style="background:rgba(255,107,107,0.2);color:var(--red)">XI</div>
            <span class="part-name">Capstone Architect Projects</span>
            <span class="part-count">7 projects</span>
            <span class="part-arrow">▾</span>
          </div>
          <div class="part-chapters">
            <div class="chapter-item"><span class="chapter-num">P.1</span><div class="chapter-info"><div class="chapter-title">Build high-performance in-memory cache</div></div><span class="chapter-level ch-arch">Architect</span></div>
            <div class="chapter-item"><span class="chapter-num">P.2</span><div class="chapter-info"><div class="chapter-title">Implement custom LINQ provider</div></div><span class="chapter-level ch-arch">Architect</span></div>
            <div class="chapter-item"><span class="chapter-num">P.3</span><div class="chapter-info"><div class="chapter-title">Create lightweight DI container</div></div><span class="chapter-level ch-arch">Architect</span></div>
            <div class="chapter-item"><span class="chapter-num">P.4</span><div class="chapter-info"><div class="chapter-title">Write high-performance logger</div></div><span class="chapter-level ch-arch">Architect</span></div>
            <div class="chapter-item"><span class="chapter-num">P.5</span><div class="chapter-info"><div class="chapter-title">Implement thread-safe collection</div></div><span class="chapter-level ch-arch">Architect</span></div>
            <div class="chapter-item"><span class="chapter-num">P.6</span><div class="chapter-info"><div class="chapter-title">Build mini ORM</div></div><span class="chapter-level ch-arch">Architect</span></div>
            <div class="chapter-item"><span class="chapter-num">P.7</span><div class="chapter-info"><div class="chapter-title">Create zero-allocation API pipeline</div></div><span class="chapter-level ch-arch">Architect</span></div>
          </div>
        </div>
      </div>
    </div>

'''

START_MARKER = '    <!-- ══════ MODULE 1: C# MASTERY ══════ -->'
END_MARKER   = '    <!-- ══════ MODULE 2: ASP.NET CORE ══════ -->'

FILES = [
    '/Users/abhishek/Desktop/abhishekpanda/public/embedded/dotnet-mastery-toc.html',
    '/Users/abhishek/Desktop/abhishekpanda/src/components/blog/dotnet-mastery-toc.html',
]

for fpath in FILES:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    start_idx = content.find(START_MARKER)
    end_idx   = content.find(END_MARKER)

    if start_idx == -1 or end_idx == -1:
        print(f'ERROR: markers not found in {fpath}')
        continue

    new_content = content[:start_idx] + NEW_MODULE1 + content[end_idx:]

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f'Patched: {fpath}')
    # Count chapters to verify
    ch_count = new_content[start_idx:new_content.find(END_MARKER, start_idx)].count('chapter-item')
    print(f'  chapter-item count in module 1: {ch_count}')

print('Done.')
