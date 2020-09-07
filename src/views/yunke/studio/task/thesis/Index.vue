<template>
  <div class="app-container">
   <div class="filter-container">
        <!-- 标题 -->
        <el-input v-model="queryParams.title" placeholder="论文标题"  class="filter-item search-item"/>
        <!-- 作者 -->
        <el-input v-model="queryParams.chargeFullName" placeholder="作者" class="filter-item search-item"/>
        <!-- 指导老师 -->
        <el-input v-model="queryParams.teacherFullName" placeholder="指导老师" class="filter-item search-item"/>
        <!-- 时间查找 -->
        <el-date-picker
          v-model="queryParams.time"
          :range-separator="null"
          start-placeholder="时间查找"
          value-format="yyyy-MM-dd"
          class="filter-item search-item date-range-item"
          type="daterange"
        />
        <!-- 搜索 -->
        <el-button class="filter-item" type="primary" plain @click="search">
            {{ $t('table.search') }}
        </el-button>
        <!-- 重置 -->
        <el-button class="filter-item" type="warning" plain @click="reset">
            {{ $t('table.reset') }}
        </el-button>
        <!-- 添加 -->
        <el-button class="filter-item" type="success" plain @click.native="add">
            {{ $t('table.add') }}
        </el-button>
        <!-- 更多操作 -->
        <!-- <el-dropdown v-has-any-permission="['task:add','task:delete','task:export']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['task:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:export']" @click.native="exportExcel">{{ $t('table.export') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown> -->
    </div>
  <!-- 表格区域 -->
  <el-table
      ref="table"
      :key="tableKey"
      :data="list"
      border
      fit
      style="width: 100%;"
      @selection-change="onSelectChange"
      @sort-change="sortChange"
      @row-click="toogleExpand"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <!-- 发表时间 -->
      <el-table-column label="发表时间" prop="publishTime" :show-overflow-tooltip="true" align="center" min-width="95px">
        <template slot-scope="scope">
          <span>{{ scope.row.publishTime }}</span>
        </template>
      </el-table-column>
      <!-- 论文标题 -->
      <el-table-column label='论文标题' prop="title" :show-overflow-tooltip="true" align="center" min-width="110px">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
       <!-- 期刊名称 -->
      <el-table-column label='期刊名称' prop="introduction" :show-overflow-tooltip="true" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.introduction }}</span>
        </template>
      </el-table-column>
      <!-- 刊号 -->
      <el-table-column label='刊号' prop="issue" :show-overflow-tooltip="true" align="center" min-width="80px">
        <template slot-scope="scope">
          <span>{{ scope.row.issue }}</span>
        </template>
      </el-table-column>
      <!-- 类型 -->
      <el-table-column
            label="类型"
            :filters="[{text:'核心', value: 1},{ text: '普通', value: 2 }]"
            :filter-method="filterPaperType"
            class-name="paperType-col"
            align="center"
            min-width="80px"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.paperType | paperTypeFilter">
            {{ row.paperType === 1 ? '核心' : '普通' }}
          </el-tag>
        </template>
      </el-table-column>
       <!-- 论文下载  -->
      <el-table-column  label="论文下载"  :show-overflow-tooltip="true" align="center" min-width="90px">
       <template slot-scope="scope">
        <el-button v-if="scope.row.url !== ''" size="mini" type="primary" plain  @click.stop="upload(scope.row.url)">下载</el-button>
        </template>
      </el-table-column>
      <!-- 作者 -->
      <el-table-column label='作者' prop="chargeFullName" :show-overflow-tooltip="true" align="center" min-width="85px">
        <template slot-scope="scope">
          <span>{{ scope.row.chargeFullName }}</span>
        </template>
      </el-table-column>
      <!-- 指导老师 -->
      <el-table-column label='指导老师' prop="teacherFullName" :show-overflow-tooltip="true" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.teacherFullName }}</span>
        </template>
      </el-table-column>
      <!-- 状态  -->
      <el-table-column
            label="状态"
            :filters="[{text: '进行中', value: 1},{ text: '已完成', value: 2 }]"
            :filter-method="filterState"
            class-name="state-col"
            align="center"
        >
            <template slot-scope="{row}">
                <el-tag :type="row.state | stateFilter">
                    {{ row.state === 2 ? '已完成' : '进行中' }}
                </el-tag>
            </template>
      </el-table-column>
      <!-- 报销情况  -->
      <!-- <el-table-column
            label="报销情况"
            :filters="[{text: '未报销', value: 0},{ text: '已报销', value: 1 }]"
            :filter-method="filterReimbursement"
            class-name="reimbursement-col"
            align="center"
            min-width="110px"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.reimbursement | reimbursementFilter">
            {{ row.reimbursement === 1 ? '已报销' : '未报销' }}
          </el-tag>
        </template>
      </el-table-column> -->
      <!-- 操作 -->
      <el-table-column :label="$t('table.operation')" align="center" min-width="145px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
            <el-tooltip
              v-hasPermission="['task:add']"
              class="item"
              effect="dark"
              content="申请报销"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:add']" class="el-icon-coin table-operation" style="color: #87d068;" @click.stop="changeReimbursement(row)" />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['task:update']"
              class="item"
              effect="dark"
              content="修改论文"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click.stop="edit(row)" />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['task:delete']"
              class="item"
              effect="dark"
              content="删除论文"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click.stop="singleDelete(row)" />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['task:view']"
              class="item"
              effect="dark"
              content="查看详情"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:view']" class="el-icon-info table-operation" style="color: #909399;" @row-click.stop="toogleExpand(row)" />
            </el-tooltip>
            <el-link v-has-no-permission="['task:add','task:view','task:update','task:delete']" class="no-perm">
              {{ $t('tips.noPermission') }}
            </el-link>
          </template>
      </el-table-column>
      <!-- 展开区域-->
      <el-table-column label="详情" type="expand" width="1px">
          <template slot-scope="props">
            <el-form label-position="left" class="table-expand">
              <el-row>
                <el-col :span="10">
                  <el-form-item label="成员:">
                    <span>{{ team.member }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label='花费:'>
                    <span>{{props.row.cost}}</span>
                  </el-form-item>
                </el-col >
                <el-col :span="4">
                  <el-form-item label='创建时间:'>
                    <span>{{props.row.time}}</span>
                  </el-form-item>
                </el-col >
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="发票:">
                    <div class="demo-image" v-if="props.row.invoice">
                      <div class="block" v-for="(item, i) in props.row.invoice.split(',')" :key="i">
                        <el-image
                          :src="item"
                          @click="showpreViewDialog(item)">
                        </el-image>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <thesis-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="40%"
      @close="previewDialogClose"
    >
      <el-image :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ThesisEdit from './Edit'
// import ThesisView from './View'
export default {
  name: 'ThesisManage',
  components: { Pagination, ThesisEdit },
  filters: {
    paperTypeFilter(paperType) {
      const map = {
        1: 'success',
        2: ''
      }
      return map[paperType]
    },
    stateFilter(state) {
      const map = {
        1: 'warning',
        2: 'success'
      }
      return map[state]
    },
    reimbursementFilter(reimbursement) {
      const map = {
        0: 'warning',
        1: 'success'
      }
      return map[reimbursement]
    }
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      // userViewVisible: false,
      tableKey: 0,
      loading: false,
      list: [],
      total: 0,
      queryParams: {},
      sort: {},
      selection: [],
      newWin: null,
      // 申请报销所需的资金对象
      Funding: {
        name: '',
        applyTime: '',
        proposerId: 0
      },
      // 保存预览图片路径
      previewPath: '',
      // 图片预览窗口的显示与隐藏
      previewVisible: false,
      team: {
        reliable: '',
        member: '',
        teacher: ''
      },
      url: '',
      pagination: {
        size: 10,
        num: 1
      },
      thesisId: '',
      title: ''
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  watch: {
    url(newVal, oldVal) {
      if (newVal && this.newWin) {
        this.newWin.sessionStorage.clear()
        this.newWin.location.href = newVal
        this.url = ''
        this.newWin = null
      }
    }
  },
  created() {
    this.fetch()
    console.log(this.$route.params.Tasks)
  },
  methods: {
    filterPaperType(value, row) {
      return row.paperType === value
    },
    filterState(value, row) {
      return row.state === value
    },
    filterReimbursement(value, row) {
      return row.reimbursement === value
    },
    // viewClose() {
    //   this.userViewVisible = false
    // },
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    upload(url) {
      this.newWin = window.open()
      this.url = url
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },
    reset() {
      this.queryParams = {}
      this.sort = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    },
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      let contain = false
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const thesisId = []
        this.selection.forEach((u) => {
          // 不能删除自己xxx
          if (u.thesisId === this.currentUser.thesisId) {
            contain = true
            return
          }
          thesisId.push(u.thesisId)
        })
        if (contain) {
          this.$message({
            message: this.$t('tips.containCurrentUser'),
            type: 'warning'
          })
          this.clearSelections()
        } else {
          this.delete(thesisId)
        }
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(thesisIds) {
      this.loading = true
      this.$delete(`studio/thesis/${thesisIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    // view(row) {
    //   this.$get(`studio/thesis/${row.thesisId}`).then((r) => {
    //     const uResult = []
    //     const data = r.data.data
    //     let userId = []
    //     let userState = []
    //     if (data.userId && typeof data.userId === 'string') {
    //       userId = data.userId.split(',')
    //     }
    //     if (data.userState && typeof data.userState === 'string') {
    //       userState = data.userState.split(',')
    //     }
    //     // 拿到uesrId及名称
    //     this.$get('system/user').then((r) => {
    //       const rows = r.data.data.rows
    //       rows.forEach((v, i) => {
    //         userId.forEach((v1, i1) => {
    //           if (v1 === ('' + v.userId)) {
    //             uResult.push(v.fullName)
    //           }
    //         })
    //       })
    //       let reliable = ''
    //       let member = ''
    //       let teacher = ''
    //       userState.forEach((v1, i1) => {
    //         if (v1 === '1') {
    //           if (reliable === '') {
    //             reliable = uResult[i1]
    //           } else {
    //             reliable += '，' + uResult[i1]
    //           }
    //         }
    //         if (v1 === '2') {
    //           if (member === '') {
    //             member = uResult[i1]
    //           } else {
    //             member += '，' + uResult[i1]
    //           }
    //         }
    //         if (v1 === '3') {
    //           if (teacher === '') {
    //             teacher = uResult[i1]
    //           } else {
    //             teacher += '，' + uResult[i1]
    //           }
    //         }
    //       })
    //       this.team = {
    //         reliable,
    //         member,
    //         teacher
    //       }
    //       // this.$refs.view.setTasks(data)
    //       // this.taskViewVisible = true
    //     })
    //   })
    // },
    // 弹出申请报销对话框
    async changeReimbursement(row) {
      // 管理员权限  任务负责人权限
      let flag = this.currentUser.roleId.indexOf('1') === -1
      const fg = row.chargeFullName !== this.currentUser.fullName
      if (!flag || !fg) {
        flag = false
      }
      if (flag) {
        return this.$message.info('仅允许管理员或任务负责人操作！')
      }
      // 检查是否已报销
      if (row.reimbursement === 1) {
        return this.$message.info('该论文任务已经报销！')
      }
      // 符合条件，弹出申请报销对话框
      const confirmResult = await this.$confirm(
        '您的报销条件已符合, 是否确认报销?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了报销')
      }
      this.Funding.applyTime = this.getTime()
      this.Funding.proposerId = this.currentUser.userId
      this.Funding.name = row.title + '论文任务报销'
      this.Funding.type = '论文'
      this.Funding.id = row.thesisId
      this.Funding.invoice = row.invoice
      this.Funding.cost = row.cost
      console.log(this.Funding)
      this.$router.push({
        name: '经费管理',
        params: {
          Funding: this.Funding
        }
      })
    },
    // 获取时间
    getTime: function() {
      var _this = this
      const yy = new Date().getFullYear()
      const mm =
        new Date().getMonth() + 1 < 10
          ? '0' + (new Date().getMonth() + 1)
          : new Date().getMonth() + 1
      const dd =
        new Date().getDate() < 10
          ? '0' + new Date().getDate()
          : new Date().getDate()
      _this.nowDate = yy + '-' + mm + '-' + dd
      return _this.nowDate
    },
    // 手风琴效果
    async toogleExpand(row) {
      this.team.member = row.memberFullName
      const $table = this.$refs.table
      this.list.map((item) => {
        if (row.thesisId !== item.thesisId) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    edit(row) {
      // 已完成的任务无法修改
      if (parseInt(row.state) === 2) {
        return this.$message.info('任务已完成无法修改！')
      }
      // 管理员权限  论文作者权限
      let flag = this.currentUser.roleId.indexOf('1') === -1
      const fg = row.chargeFullName !== this.currentUser.fullName
      if (!flag || !fg) {
        flag = false
      }
      if (flag) {
        return this.$message.info('仅允许管理员或论文作者操作！')
      }
      let userId = row.members
      let reliable = ''
      const member = []
      const teacher = []
      userId.forEach((v1, i1) => {
        if (v1.state === 1) {
          reliable = '' + v1.userId
        }
        if (v1.state === 2) {
          member.push('' + v1.userId)
        }
        if (v1.state === 3) {
          teacher.push('' + v1.userId)
        }
      })
      row.reliable = reliable
      row.member = member
      row.teacher = teacher
      this.$refs.edit.setTasks(row)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.startTime = this.queryParams.timeRange[0]
        params.endTime = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('studio/thesis', {
        ...params
      }).then((r) => {
        console.log(r)
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.TakeTeams(data.rows)
        this.loading = false
      })
    },
    TakeTeams(list) {
      list.forEach((v, i) => {
        if (v.invoice === null) {
          v.invoice = ''
        }
        v.members.forEach((v1, i1) => {
          if (v1.state === 1) {
            v.chargeFullName = v1.fullName
          }
          if (v1.state === 3) {
            v.teacherFullName = v1.fullName
          }
          if (v1.state === 2) {
            if (v.memberFullName === undefined) {
              v.memberFullName = v1.fullName
            } else {
              v.memberFullName += '，' + v1.fullName
            }
          }
        })
      })
      this.list = list
    },
    handleClose() {
      this.inVoiceDialogVisible = false
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      if ('url' in file) {
        this.previewPath = file.url
      } else {
        this.previewPath = file.response.data.url
      }
      this.previewVisible = true
    },
    // 查看发票图片
    showpreViewDialog(item) {
      this.previewPath = item
      this.previewVisible = true
    },
    // 图片预览关闭
    previewDialogClose() {
      this.previewPath = ''
      this.previewVisible = false
    },
    sortChange(val) {
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    }
  }
}
</script>
<style lang="scss" scoped>
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 90px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
.invoiceUl {
  list-style: none;
  margin: 0;
}
.invoiceUl .invoiceLi {
  cursor: pointer;
}
.table-expand[data-v-7ec7feb6] {
  display: flex;
}
.demo-image {
  display: flex;
}
.demo-image .el-image {
  width: 100px;
  height: 100px;
  margin: 0px 10px;
  border:  1px solid #000;
}
.previewImg {
  width: 100%;
}
</style>
